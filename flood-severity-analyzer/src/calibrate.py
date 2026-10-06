"""
Score calibration for Flood Severity Assessment model.

Applies Isotonic Regression calibration to correct systematic score bias
(the model's raw 0–10 outputs may skew toward the dataset mean).

Usage:
  python3 src/calibrate.py \
    --data-csv data/annotations.csv \
    --img-dir data \
    --checkpoint checkpoints/best_model.pth \
    --output checkpoints/calibration.pkl
"""

import argparse
import os
import sys
import pickle

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np
import pandas as pd
import torch
from sklearn.isotonic import IsotonicRegression
from sklearn.model_selection import train_test_split

from dataset import FloodDataset, get_transforms
from infer import load_single_model


def collect_predictions(model, dataloader, device):
    model.eval()
    all_preds, all_targets = [], []
    with torch.no_grad():
        for images, targets, _ in dataloader:
            images  = images.to(device)
            pred, _, _, _ = model(images)
            all_preds.extend(pred.cpu().numpy())
            all_targets.extend(targets.numpy())
    return np.array(all_preds), np.array(all_targets)


def calibrate(args):
    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    print(f"[*] Calibration on device: {device}")

    model = load_single_model(args.checkpoint, device)

    df = pd.read_csv(args.data_csv)
    _, cal_df = train_test_split(df, test_size=0.3, random_state=99)
    print(f"[*] Calibration set: {len(cal_df)} samples")

    cal_dataset = FloodDataset(cal_df, img_dir=args.img_dir, transform=get_transforms("val"))
    cal_loader  = torch.utils.data.DataLoader(cal_dataset, batch_size=16, shuffle=False, num_workers=0)

    preds, targets = collect_predictions(model, cal_loader, device)

    # Isotonic regression calibrator (maps model outputs to calibrated scores)
    iso = IsotonicRegression(y_min=0.0, y_max=10.0, out_of_bounds="clip")
    iso.fit(preds, targets)

    cal_preds = iso.predict(preds)
    mae_before = np.mean(np.abs(preds - targets))
    mae_after  = np.mean(np.abs(cal_preds - targets))
    print(f"[*] MAE before calibration: {mae_before:.3f}")
    print(f"[✓] MAE after calibration:  {mae_after:.3f}")

    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    with open(args.output, "wb") as f:
        pickle.dump(iso, f)
    print(f"[✓] Calibrator saved to: {args.output}")


def load_calibrator(path: str):
    with open(path, "rb") as f:
        return pickle.load(f)


def apply_calibration(raw_score: float, calibrator_path: str) -> float:
    """Apply isotonic calibration to a raw model score."""
    if not os.path.exists(calibrator_path):
        return raw_score  # no calibration available, pass-through
    iso = load_calibrator(calibrator_path)
    return float(np.clip(iso.predict([raw_score])[0], 0.0, 10.0))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-csv",   type=str, required=True)
    parser.add_argument("--img-dir",    type=str, default=None)
    parser.add_argument("--checkpoint", type=str, default="checkpoints/best_model.pth")
    parser.add_argument("--output",     type=str, default="checkpoints/calibration.pkl")
    args = parser.parse_args()
    calibrate(args)
