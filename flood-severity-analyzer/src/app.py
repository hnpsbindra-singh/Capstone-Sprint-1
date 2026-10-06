"""
AI Flood Severity Assessment & Explainability Platform (v3 Production Suite).

Features:
  1. Single-Image Deep Assessment with GradCAM++ & Uncertainty estimation
  2. Temporal Differential Analysis (Dry Reference vs Flooded Frame change detection)
  3. Ultra-Fast Edge ONNX Runtime Inference & Latency Benchmark
"""

import os
import sys
import time
import cv2
import gradio as gr
import numpy as np
from PIL import Image
import torch
import onnxruntime as ort

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dataset import get_transforms, get_tta_transforms, get_severity_category
from model import FloodSeverityNet
from calibrate import apply_calibration
from differential import compute_differential_flood_analysis

MODELS = None
DEVICE = None
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHECKPOINT_V2 = os.path.join(BASE_DIR, "checkpoints_v2", "best_model.pth")
CHECKPOINT_V1 = os.path.join(BASE_DIR, "checkpoints", "best_model.pth")
ONNX_MODEL_PATH = os.path.join(BASE_DIR, "checkpoints_v2", "flood_severity_net.onnx")
CALIBRATOR_PATH = os.path.join(BASE_DIR, "checkpoints_v2", "calibration.pkl")


def get_models():
    global MODELS, DEVICE
    if MODELS is None:
        DEVICE = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
        ckpt_path = CHECKPOINT_V2 if os.path.exists(CHECKPOINT_V2) else CHECKPOINT_V1
        if not os.path.exists(ckpt_path):
            raise FileNotFoundError(f"No checkpoint found at {ckpt_path}.")
        ckpt = torch.load(ckpt_path, map_location=DEVICE)
        backbone = ckpt.get("backbone", "efficientnet_b2")
        use_fpn = ckpt.get("use_fpn", True)
        use_seg = ckpt.get("use_seg_head", True)
        m = FloodSeverityNet(backbone_name=backbone, pretrained=False, use_fpn=use_fpn, use_seg_head=use_seg)
        m.load_state_dict(ckpt["model_state_dict"])
        m.to(DEVICE).eval()
        m.register_cam_hooks()
        MODELS = [m]
    return MODELS, DEVICE


# ── Tab 1: Single Image Analysis ─────────────────────────────────────────────
def analyze_single_flood_image(input_image):
    if input_image is None:
        return "N/A", "Please upload an image.", {}, None

    try:
        models, device = get_models()
    except Exception as e:
        return "Error", f"Could not load model: {e}", {}, None

    img_pil = Image.fromarray(input_image).convert("RGB")

    # GradCAM++ from primary model
    base_tfm = get_transforms("val", img_size=224)
    tensor = base_tfm(img_pil).unsqueeze(0).to(device)
    severity_cam, _, _, cam_heatmap = models[0].compute_gradcam_pp(tensor)

    # TTA averaging
    tta_tfms = get_tta_transforms(224, n_augments=4)
    scores, attrs_list = [], []
    with torch.no_grad():
        for tfm in tta_tfms:
            t = tfm(img_pil).unsqueeze(0).to(device)
            ps, _, pa, _ = models[0](t)
            scores.append(ps.item())
            attrs_list.append(pa.cpu().numpy()[0])

    severity = float(np.clip(np.mean(scores), 0.0, 10.0))
    std_score = float(np.std(scores))
    severity_cal = apply_calibration(severity, CALIBRATOR_PATH)
    attrs = np.clip(np.mean(attrs_list, axis=0), 0.0, 10.0)

    water_depth = round(float(attrs[0]), 1)
    vehicle_risk = round(float(attrs[1]), 1)
    struct_risk = round(float(attrs[2]), 1)
    score_display = round(severity_cal, 2)
    std_display = round(std_score, 2)
    category = get_severity_category(score_display)
    tier_label = category.split(" ")[0]

    # Heatmap overlay with Turbo colormap
    orig_np = np.array(img_pil.resize((224, 224)))
    cam_resized = cv2.resize(cam_heatmap, (224, 224))
    heatmap_col = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_TURBO)
    heatmap_col = cv2.cvtColor(heatmap_col, cv2.COLOR_BGR2RGB)
    overlay = np.uint8(0.55 * orig_np + 0.45 * heatmap_col)

    advisory_map = {
        "Low": "🟢 **Low Risk**: Minor puddles / wet roads. Normal transit and municipal operations.",
        "Moderate": "🟡 **Moderate Risk**: Shin-deep water. Sedans should avoid low-lying roads. Monitor stormwater drains.",
        "High": "🟠 **High / Severe Risk**: Knee-to-waist deep water. Vehicles submerged. Ground floors flooded.",
        "Extreme": "🔴 **Extreme Hazard**: Catastrophic inundation. Rushing currents, roof-level flooding, structural collapse danger.",
    }
    advisory = advisory_map.get(tier_label, "")

    severity_text = f"{score_display} / 10.0  (±{std_display})  [{tier_label}]"
    markdown_output = f"### {category}\n\n{advisory}"

    features = {
        f"Water Extent / Depth ({water_depth}/10)": water_depth / 10.0,
        f"Vehicle Submersion Risk ({vehicle_risk}/10)": vehicle_risk / 10.0,
        f"Structural Hazard Risk ({struct_risk}/10)": struct_risk / 10.0,
    }
    return severity_text, markdown_output, features, overlay


# ── Tab 2: Temporal Differential Analysis ────────────────────────────────────
def analyze_differential(dry_img, flood_img):
    if dry_img is None or flood_img is None:
        return "Please upload both reference dry and flooded images.", 0.0, None

    result = compute_differential_flood_analysis(dry_img, flood_img)
    summary = (
        f"### Change Detection Severity: **{result['delta_severity_score']} / 10.0**\n\n"
        f"- **Estimated Ground Inundation Area:** {result['inundated_ratio_ground']}%\n"
        f"- **Roadway Landmark Disappearance:** "
        f"{'Severe (curbs/lanes obscured)' if result['inundated_ratio_ground'] > 40 else 'Partial ponding'}\n"
    )
    return summary, result["composite_image"]


# ── Tab 3: ONNX Runtime Edge Benchmark ───────────────────────────────────────
def analyze_onnx_benchmark(input_image):
    if input_image is None:
        return "Please upload an image.", None

    if not os.path.exists(ONNX_MODEL_PATH):
        return f"ONNX model not found at {ONNX_MODEL_PATH}. Export first.", None

    session = ort.InferenceSession(ONNX_MODEL_PATH, providers=["CPUExecutionProvider"])
    input_name = session.get_inputs()[0].name

    # Preprocess
    img_pil = Image.fromarray(input_image).convert("RGB").resize((224, 224))
    arr = np.array(img_pil, dtype=np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    norm = (arr - mean) / std
    chw = np.transpose(norm, (2, 0, 1))
    tensor = np.expand_dims(chw, axis=0)

    # Benchmark 10 iterations
    start = time.perf_counter()
    for _ in range(10):
        outs = session.run(None, {input_name: tensor})
    latency_ms = (time.perf_counter() - start) * 1000.0 / 10.0

    score = float(np.clip(outs[0][0], 0.0, 10.0))
    attrs = np.clip(outs[2][0], 0.0, 10.0)

    report = (
        f"### ⚡ ONNX Edge Inference Result\n\n"
        f"- **Severity Score:** **{score:.2f} / 10.0**\n"
        f"- **Latency (CPU):** **{latency_ms:.2f} ms** per frame\n"
        f"- **Throughput:** **{1000.0 / latency_ms:.1f} FPS** (Real-Time)\n"
        f"- **Water Depth:** {attrs[0]:.1f}/10 | **Vehicle Risk:** {attrs[1]:.1f}/10 | **Structural Risk:** {attrs[2]:.1f}/10\n"
    )
    return report, input_image


def build_app():
    with gr.Blocks(title="Flood Severity Assessment AI", theme=gr.themes.Soft()) as demo:
        gr.Markdown("# 🌊 Flood Severity Assessment & Explainability Platform")
        gr.Markdown(
            "State-of-the-art Deep Learning system predicting flood severity (0.0 to 10.0) "
            "with feature hazard attribution, GradCAM++ heatmaps, change detection, and ONNX edge inference."
        )

        with gr.Tabs():
            # Tab 1
            with gr.TabItem("🔍 Single Image Deep Assessment"):
                with gr.Row():
                    with gr.Column(scale=1):
                        img1 = gr.Image(type="numpy", label="Upload Flood Scene")
                        btn1 = gr.Button("Analyze Severity", variant="primary", size="lg")
                    with gr.Column(scale=1):
                        score1 = gr.Textbox(label="Severity Score (0–10) ± Uncertainty")
                        desc1 = gr.Markdown()
                        feats1 = gr.Label(label="Visual Feature Risk Breakdown")
                        cam1 = gr.Image(label="GradCAM++ Critical Hazard Heatmap Overlay")
                btn1.click(analyze_single_flood_image, inputs=[img1], outputs=[score1, desc1, feats1, cam1])

            # Tab 2
            with gr.TabItem("⏱️ Temporal / Change Detection Mode"):
                gr.Markdown(
                    "Compare a **Reference Dry Scene** against a **Flooded Scene** (e.g. from traffic or CCTV cameras) "
                    "for high-precision differential change detection and ground water coverage calculation."
                )
                with gr.Row():
                    with gr.Column(scale=1):
                        dry_in = gr.Image(type="numpy", label="Dry / Normal Weather Baseline")
                        flood_in = gr.Image(type="numpy", label="Current Flooded Scene")
                        btn2 = gr.Button("Compute Differential Inundation", variant="primary", size="lg")
                    with gr.Column(scale=1):
                        diff_text = gr.Markdown()
                        diff_vis = gr.Image(label="Differential Composite: [Dry Reference | Current Flood | Water Change Overlay]")
                btn2.click(analyze_differential, inputs=[dry_in, flood_in], outputs=[diff_text, diff_vis])

            # Tab 3
            with gr.TabItem("⚡ Ultra-Fast Edge ONNX Runtime"):
                gr.Markdown(
                    "Deploy on edge servers, drones, or CCTV cameras with **ONNX Runtime** (zero heavy PyTorch dependencies, ~30ms latency)."
                )
                with gr.Row():
                    with gr.Column(scale=1):
                        onnx_img = gr.Image(type="numpy", label="Upload Scene for ONNX Inference")
                        btn3 = gr.Button("Run ONNX Inference & Latency Benchmark", variant="primary", size="lg")
                    with gr.Column(scale=1):
                        onnx_report = gr.Markdown()
                        onnx_vis = gr.Image(label="Input Scene")
                btn3.click(analyze_onnx_benchmark, inputs=[onnx_img], outputs=[onnx_report, onnx_vis])

    return demo


if __name__ == "__main__":
    demo = build_app()
    demo.launch(server_name="127.0.0.1", server_port=7860, share=False)
