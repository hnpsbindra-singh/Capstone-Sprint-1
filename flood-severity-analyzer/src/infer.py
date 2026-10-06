"""
IMPROVED Inference & Explainability for Flood Severity Assessment.

Improvements over v1:
  - GradCAM++ (sharper, more localized heatmaps)
  - Test-Time Augmentation (TTA): averages predictions over multiple views
  - Ensemble inference: loads multiple trained models and averages scores
  - Uncertainty display: ± prediction std from logvar head
"""

import argparse
import os
import sys
import glob

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import cv2
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
import torch

from dataset import get_transforms, get_tta_transforms, get_severity_category
from model import FloodSeverityNet


# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------
def load_single_model(checkpoint_path: str, device: torch.device) -> FloodSeverityNet:
    if not os.path.exists(checkpoint_path):
        raise FileNotFoundError(f"Checkpoint not found: {checkpoint_path}")
    ckpt = torch.load(checkpoint_path, map_location=device)
    backbone  = ckpt.get("backbone", "efficientnet_b2")
    use_fpn   = ckpt.get("use_fpn", True)
    use_seg   = ckpt.get("use_seg_head", True)

    model = FloodSeverityNet(
        backbone_name=backbone,
        pretrained=False,
        use_fpn=use_fpn,
        use_seg_head=use_seg,
    )
    model.load_state_dict(ckpt["model_state_dict"])
    model.to(device).eval()
    model.register_cam_hooks()
    return model


def load_ensemble(checkpoint_dir: str, device: torch.device) -> list:
    """
    Loads all *.pth files in checkpoint_dir as an ensemble.
    If only one file exists, returns a single-model list.
    """
    paths = sorted(glob.glob(os.path.join(checkpoint_dir, "*.pth")))
    if not paths:
        raise FileNotFoundError(f"No checkpoints found in {checkpoint_dir}")
    models = [load_single_model(p, device) for p in paths]
    print(f"[*] Loaded ensemble of {len(models)} model(s): {[os.path.basename(p) for p in paths]}")
    return models


# ---------------------------------------------------------------------------
# TTA inference
# ---------------------------------------------------------------------------
def predict_with_tta(
    image_pil: Image.Image,
    model: FloodSeverityNet,
    device: torch.device,
    img_size: int = 224,
    n_augments: int = 6,
) -> tuple:
    """
    Test-Time Augmentation: runs `n_augments` views through the model,
    averages severity scores and attributes for a robust prediction.

    Returns (mean_score, std_score, mean_attributes)
    """
    tta_transforms = get_tta_transforms(img_size, n_augments)
    scores = []
    attrs_list = []

    with torch.no_grad():
        for tfm in tta_transforms:
            tensor = tfm(image_pil).unsqueeze(0).to(device)
            pred_sev, pred_lv, pred_attrs, _ = model(tensor)
            scores.append(pred_sev.item())
            attrs_list.append(pred_attrs.cpu().numpy()[0])

    mean_score = float(np.clip(np.mean(scores), 0.0, 10.0))
    std_score  = float(np.std(scores))
    mean_attrs = np.clip(np.mean(attrs_list, axis=0), 0.0, 10.0)
    return mean_score, std_score, mean_attrs


# ---------------------------------------------------------------------------
# Ensemble + TTA inference
# ---------------------------------------------------------------------------
def predict_ensemble_tta(
    image_pil: Image.Image,
    models: list,
    device: torch.device,
    img_size: int = 224,
    n_augments: int = 4,
) -> tuple:
    """
    Combines ensemble (multiple models) + TTA (multiple views per model).
    """
    all_scores = []
    all_attrs  = []

    for model in models:
        s, _, a = predict_with_tta(image_pil, model, device, img_size, n_augments)
        all_scores.append(s)
        all_attrs.append(a)

    mean_score = float(np.clip(np.mean(all_scores), 0.0, 10.0))
    std_score  = float(np.std(all_scores))
    mean_attrs = np.clip(np.mean(all_attrs, axis=0), 0.0, 10.0)
    return mean_score, std_score, mean_attrs


# ---------------------------------------------------------------------------
# Full prediction pipeline
# ---------------------------------------------------------------------------
def predict_flood_severity(
    image_path: str,
    models: list,
    device: torch.device,
    img_size: int = 224,
    save_viz_path: str = None,
    n_augments: int = 6,
) -> dict:
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    image_pil = Image.open(image_path).convert("RGB")

    # GradCAM++ from first model (for visualization)
    base_transform = get_transforms("val", img_size)
    tensor_for_cam = base_transform(image_pil).unsqueeze(0).to(device)
    severity_cam, uncertainty_cam, attrs_cam, cam_heatmap = models[0].compute_gradcam_pp(tensor_for_cam)

    # Ensemble + TTA for final prediction
    if len(models) > 1:
        severity, std_score, attrs = predict_ensemble_tta(image_pil, models, device, img_size, n_augments)
    else:
        severity, std_score, attrs = predict_with_tta(image_pil, models[0], device, img_size, n_augments)

    category = get_severity_category(severity)

    # Visualization
    orig_np = np.array(image_pil.resize((img_size, img_size)))
    cam_resized = cv2.resize(cam_heatmap, (img_size, img_size))
    heatmap_colored = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_TURBO)
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
    overlay = np.uint8(0.55 * orig_np + 0.45 * heatmap_colored)

    if save_viz_path:
        fig, axes = plt.subplots(1, 3, figsize=(15, 4.5))
        axes[0].imshow(orig_np)
        axes[0].set_title("Original Image", fontweight="bold")
        axes[0].axis("off")

        im = axes[1].imshow(cam_resized, cmap="turbo", vmin=0, vmax=1)
        axes[1].set_title("GradCAM++ Heatmap", fontweight="bold")
        axes[1].axis("off")
        plt.colorbar(im, ax=axes[1], fraction=0.046)

        axes[2].imshow(overlay)
        tier_label = category.split(" ")[0]
        axes[2].set_title(
            f"Severity: {severity:.1f}/10 ±{std_score:.1f} ({tier_label})",
            fontweight="bold",
            color={"Low": "green", "Moderate": "goldenrod", "High": "darkorange", "Extreme": "red"}.get(tier_label, "black"),
        )
        axes[2].axis("off")

        plt.suptitle(
            f"Features  |  Water: {attrs[0]:.1f}/10  "
            f"Vehicle Risk: {attrs[1]:.1f}/10  "
            f"Structural Risk: {attrs[2]:.1f}/10",
            fontsize=10, y=0.02
        )
        plt.tight_layout()
        os.makedirs(os.path.dirname(os.path.abspath(save_viz_path)), exist_ok=True)
        plt.savefig(save_viz_path, dpi=200, bbox_inches="tight")
        plt.close()

    return {
        "image_path": image_path,
        "severity_score": round(severity, 2),
        "uncertainty_std": round(std_score, 2),
        "severity_scale": "0.0 - 10.0",
        "category": category,
        "n_models": len(models),
        "n_tta_views": n_augments,
        "features": {
            "water_depth_extent": round(float(attrs[0]), 2),
            "vehicle_submersion_risk": round(float(attrs[1]), 2),
            "structural_hazard_risk": round(float(attrs[2]), 2),
        },
        "visualization_path": save_viz_path,
    }, overlay


def main():
    parser = argparse.ArgumentParser(description="Improved Flood Severity Inference (TTA + Ensemble + GradCAM++)")
    parser.add_argument("--image",       type=str, required=True)
    parser.add_argument("--checkpoint",  type=str, default="checkpoints/best_model.pth",
                        help="Single checkpoint OR directory for ensemble")
    parser.add_argument("--save-viz",    type=str, default="outputs/prediction_cam.png")
    parser.add_argument("--n-augments",  type=int, default=6, help="Number of TTA views")
    parser.add_argument("--img-size",    type=int, default=224)
    args = parser.parse_args()

    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    print(f"[*] Running inference on: {device}")

    # Load single or ensemble
    if os.path.isdir(args.checkpoint):
        models = load_ensemble(args.checkpoint, device)
    else:
        models = [load_single_model(args.checkpoint, device)]

    result, _ = predict_flood_severity(
        args.image, models, device,
        img_size=args.img_size,
        save_viz_path=args.save_viz,
        n_augments=args.n_augments,
    )

    print("\n" + "=" * 60)
    print("      FLOOD SEVERITY ASSESSMENT REPORT  (v2)")
    print("=" * 60)
    print(f" Image:              {result['image_path']}")
    print(f" Severity Score:     {result['severity_score']} / 10.0  ±{result['uncertainty_std']}")
    print(f" Hazard Category:    {result['category']}")
    print(f" Models in Ensemble: {result['n_models']}  |  TTA views: {result['n_tta_views']}")
    print("-" * 60)
    print(" FEATURE ATTRIBUTE BREAKDOWN:")
    print(f"  • Water Depth / Extent:     {result['features']['water_depth_extent']} / 10.0")
    print(f"  • Vehicle Submersion Risk:  {result['features']['vehicle_submersion_risk']} / 10.0")
    print(f"  • Structural Hazard Risk:   {result['features']['structural_hazard_risk']} / 10.0")
    print("-" * 60)
    if args.save_viz:
        print(f" GradCAM++ Heatmap saved to: {args.save_viz}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
