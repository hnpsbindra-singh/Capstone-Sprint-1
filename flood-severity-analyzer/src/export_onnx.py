"""
Export PyTorch FloodSeverityNet model to ONNX format.
Enables high-performance, low-latency deployment on edge devices,
mobile units, and serverless environments without PyTorch dependencies.
"""

import argparse
import os
import sys
import torch
import onnx
import onnxruntime as ort

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from model import FloodSeverityNet


class ExportableSeverityNet(torch.nn.Module):
    """
    Wrapper around FloodSeverityNet that returns clean standard tensors for ONNX.
    """
    def __init__(self, model: FloodSeverityNet):
        super().__init__()
        self.model = model

    def forward(self, x: torch.Tensor):
        severity, logvar, attributes, _ = self.model(x)
        return severity, logvar, attributes


def export_model_to_onnx(
    checkpoint_path: str = "checkpoints_v2/best_model.pth",
    output_onnx_path: str = "checkpoints_v2/flood_severity_net.onnx",
    img_size: int = 224,
):
    print(f"[*] Loading PyTorch checkpoint: {checkpoint_path}")
    checkpoint = torch.load(checkpoint_path, map_location="cpu")
    backbone = checkpoint.get("backbone", "efficientnet_b2")
    use_fpn = checkpoint.get("use_fpn", True)
    use_seg = checkpoint.get("use_seg_head", True)

    model = FloodSeverityNet(
        backbone_name=backbone,
        pretrained=False,
        use_fpn=use_fpn,
        use_seg_head=use_seg,
    )
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    exportable_model = ExportableSeverityNet(model)
    dummy_input = torch.randn(1, 3, img_size, img_size, dtype=torch.float32)

    os.makedirs(os.path.dirname(os.path.abspath(output_onnx_path)), exist_ok=True)
    print(f"[*] Exporting to ONNX: {output_onnx_path}...")

    torch.onnx.export(
        exportable_model,
        dummy_input,
        output_onnx_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=["input_image"],
        output_names=["severity_score", "logvar", "attributes"],
        dynamic_axes={
            "input_image": {0: "batch_size"},
            "severity_score": {0: "batch_size"},
            "logvar": {0: "batch_size"},
            "attributes": {0: "batch_size"},
        },
    )

    # Verify model with onnx checker
    onnx_model = onnx.load(output_onnx_path)
    onnx.checker.check_model(onnx_model)
    print(f"[✓] ONNX model successfully validated!")

    # Verify ONNX Runtime inference
    ort_session = ort.InferenceSession(output_onnx_path, providers=["CPUExecutionProvider"])
    ort_inputs = {"input_image": dummy_input.numpy()}
    ort_outs = ort_session.run(None, ort_inputs)

    sev_out = ort_outs[0]
    attr_out = ort_outs[2]
    print(f"[✓] ONNX Runtime smoke test successful:")
    print(f"    Output severity shape: {sev_out.shape}, score: {sev_out[0]:.2f}/10")
    print(f"    Output attributes shape: {attr_out.shape}")
    print(f"    File size: {os.path.getsize(output_onnx_path) / (1024 * 1024):.2f} MB")
    return output_onnx_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", default="checkpoints_v2/best_model.pth")
    parser.add_argument("--output", default="checkpoints_v2/flood_severity_net.onnx")
    args = parser.parse_args()
    export_model_to_onnx(args.checkpoint, args.output)
