"""
Lightweight, ultra-fast ONNX Runtime inference script for Flood Severity Assessment.
Runs independently without PyTorch dependencies, ideal for edge devices and servers.
"""

import argparse
import time
import numpy as np
from PIL import Image
import onnxruntime as ort


def preprocess_image(image_path: str, img_size: int = 224) -> np.ndarray:
    """Preprocesses image using standard NumPy operations (ImageNet normalization)."""
    img = Image.open(image_path).convert("RGB").resize((img_size, img_size))
    arr = np.array(img, dtype=np.float32) / 255.0

    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    norm = (arr - mean) / std

    # HWC to NCHW
    chw = np.transpose(norm, (2, 0, 1))
    return np.expand_dims(chw, axis=0)


def run_onnx_inference(
    image_path: str,
    onnx_path: str = "checkpoints_v2/flood_severity_net.onnx",
    benchmark_runs: int = 20,
) -> dict:
    session = ort.InferenceSession(onnx_path, providers=["CPUExecutionProvider"])
    input_name = session.get_inputs()[0].name

    tensor = preprocess_image(image_path)

    # Warmup
    session.run(None, {input_name: tensor})

    # Benchmark latency
    start = time.perf_counter()
    for _ in range(benchmark_runs):
        outs = session.run(None, {input_name: tensor})
    total_time = (time.perf_counter() - start) * 1000.0 / benchmark_runs

    severity = float(np.clip(outs[0][0], 0.0, 10.0))
    attrs = np.clip(outs[2][0], 0.0, 10.0)

    tier = "Low" if severity < 2.5 else "Moderate" if severity < 5.0 else "High" if severity < 7.5 else "Extreme"

    return {
        "image": image_path,
        "severity_score": round(severity, 2),
        "hazard_tier": tier,
        "attributes": {
            "water_depth": round(float(attrs[0]), 2),
            "vehicle_risk": round(float(attrs[1]), 2),
            "structural_risk": round(float(attrs[2]), 2),
        },
        "latency_ms": round(total_time, 2),
        "fps": round(1000.0 / total_time, 1),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True)
    parser.add_argument("--onnx-model", default="checkpoints_v2/flood_severity_net.onnx")
    parser.add_argument("--benchmark", type=int, default=20)
    args = parser.parse_args()

    res = run_onnx_inference(args.image, args.onnx_model, args.benchmark)
    print("\n" + "=" * 55)
    print("      ONNX RUNTIME EDGE INFERENCE REPORT")
    print("=" * 55)
    print(f" Image:          {res['image']}")
    print(f" Severity Score: {res['severity_score']} / 10.0  ({res['hazard_tier']})")
    print(f" Features:       Water={res['attributes']['water_depth']}/10 | Cars={res['attributes']['vehicle_risk']}/10 | Struct={res['attributes']['structural_risk']}/10")
    print(f" Latency:        {res['latency_ms']} ms/image ({res['fps']} FPS)")
    print("=" * 55 + "\n")
