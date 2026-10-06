"""
IMPROVED Training pipeline for Flood Severity Assessment Model.

Improvements over v1:
  - Ordinal pairwise ranking loss
  - Gaussian NLL uncertainty loss
  - Optional segmentation auxiliary loss
  - Class-balanced WeightedRandomSampler
  - Soft label smoothing
  - Multiple backbone choices (efficientnet_b2, convnext_tiny, etc.)
  - Gradient clipping for stability
  - Richer metric reporting (MAE, RMSE, Rank Corr, Tier Acc, Uncertainty)
"""

import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from scipy.stats import spearmanr
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from tqdm import tqdm

from dataset import FloodDataset, get_transforms, get_severity_category, make_balanced_sampler
from model import FloodSeverityNet


def get_device() -> torch.device:
    if torch.backends.mps.is_available():
        return torch.device("mps")
    elif torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


# ---------------------------------------------------------------------------
# Loss Functions
# ---------------------------------------------------------------------------
class OrdinalRankingLoss(nn.Module):
    """
    Pairwise ordinal ranking loss.
    Penalizes predictions where a higher-severity image scores lower than
    a lower-severity image (ordering inversions), with a margin of 0.5.
    """
    def __init__(self, margin: float = 0.5):
        super().__init__()
        self.margin = margin

    def forward(self, preds: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        # Compare all pairs in batch
        pred_i = preds.unsqueeze(1)   # (B, 1)
        pred_j = preds.unsqueeze(0)   # (1, B)
        tgt_i  = targets.unsqueeze(1)
        tgt_j  = targets.unsqueeze(0)

        # Expected sign: +1 if target_i > target_j, -1 if target_i < target_j
        sign = torch.sign(tgt_i - tgt_j)  # (B, B)

        # Only penalize pairs with meaningfully different targets
        valid_mask = (tgt_i - tgt_j).abs() > 0.5

        ranking_violation = F.relu(self.margin - sign * (pred_i - pred_j))
        loss = (ranking_violation * valid_mask.float()).sum()
        denom = valid_mask.float().sum().clamp(min=1.0)
        return loss / denom


class GaussianNLLLoss(nn.Module):
    """
    Gaussian Negative Log-Likelihood loss for uncertainty-aware training.
    Penalizes both wrong predictions AND overconfident wrong predictions.
    """
    def forward(self, pred: torch.Tensor, logvar: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
        var = torch.exp(logvar).clamp(min=1e-4)
        nll = 0.5 * (logvar + (pred - target) ** 2 / var)
        return nll.mean()


# ---------------------------------------------------------------------------
# Evaluation
# ---------------------------------------------------------------------------
def evaluate(model, dataloader, device) -> dict:
    model.eval()
    all_preds, all_targets, all_uncertainties = [], [], []
    total_loss = 0.0
    criterion_sev = nn.SmoothL1Loss()

    with torch.no_grad():
        for images, targets, attributes in dataloader:
            images   = images.to(device)
            targets  = targets.to(device)

            pred_sev, pred_lv, pred_attrs, _ = model(images)
            loss = criterion_sev(pred_sev, targets)
            total_loss += loss.item() * len(targets)

            all_preds.extend(pred_sev.cpu().numpy())
            all_targets.extend(targets.cpu().numpy())
            all_uncertainties.extend(torch.exp(0.5 * pred_lv).cpu().numpy())

    all_preds = np.array(all_preds)
    all_targets = np.array(all_targets)
    all_unc = np.array(all_uncertainties)

    mae  = float(np.mean(np.abs(all_preds - all_targets)))
    rmse = float(np.sqrt(np.mean((all_preds - all_targets) ** 2)))

    pred_tiers = [get_severity_category(p) for p in all_preds]
    true_tiers = [get_severity_category(t) for t in all_targets]
    tier_acc = float(np.mean([p == t for p, t in zip(pred_tiers, true_tiers)]))

    if len(all_preds) > 1 and np.std(all_preds) > 1e-5:
        s_corr, _ = spearmanr(all_preds, all_targets)
    else:
        s_corr = 0.0

    return {
        "val_loss": total_loss / len(dataloader.dataset),
        "mae": mae,
        "rmse": rmse,
        "tier_accuracy": tier_acc,
        "spearman_rank_corr": float(s_corr),
        "mean_uncertainty": float(all_unc.mean()),
    }


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------
def train_model(args):
    os.makedirs(args.output_dir, exist_ok=True)
    device = get_device()
    print(f"[*] Training on device: {device}")
    print(f"[*] Backbone: {args.backbone}  |  FPN: {not args.no_fpn}  |  SegHead: {not args.no_seg}")

    df = pd.read_csv(args.data_csv)
    print(f"[*] Total dataset: {len(df)} samples")

    train_df, val_df = train_test_split(df, test_size=args.val_split, random_state=42)
    print(f"[*] Train: {len(train_df)}, Val: {len(val_df)}")

    train_dataset = FloodDataset(
        train_df,
        img_dir=args.img_dir,
        transform=get_transforms("train", args.img_size),
        soft_labels=True,
        soft_label_sigma=0.3,
    )
    val_dataset = FloodDataset(
        val_df,
        img_dir=args.img_dir,
        transform=get_transforms("val", args.img_size),
        soft_labels=False,
    )

    # Balanced sampler to handle tier imbalance
    sampler = make_balanced_sampler(train_dataset)
    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, sampler=sampler, num_workers=0)
    val_loader   = DataLoader(val_dataset,   batch_size=args.batch_size, shuffle=False,   num_workers=0)

    # Model
    model = FloodSeverityNet(
        backbone_name=args.backbone,
        pretrained=args.pretrained,
        dropout_rate=args.dropout,
        use_fpn=not args.no_fpn,
        use_seg_head=not args.no_seg,
    ).to(device)

    # Loss functions
    criterion_huber   = nn.SmoothL1Loss(beta=1.0)
    criterion_attr    = nn.SmoothL1Loss(beta=1.0)
    criterion_ranking = OrdinalRankingLoss(margin=0.5)
    criterion_gauss   = GaussianNLLLoss()

    # Optimizer: separate LR for backbone vs heads
    backbone_params = []
    head_params = []
    for name, p in model.named_parameters():
        if any(k in name for k in ["stem", "layer3", "layer4"]):
            backbone_params.append(p)
        else:
            head_params.append(p)

    optimizer = torch.optim.AdamW([
        {"params": backbone_params, "lr": args.lr * 0.1},  # slower backbone fine-tune
        {"params": head_params,     "lr": args.lr},         # faster heads
    ], weight_decay=1e-4)

    scheduler = torch.optim.lr_scheduler.CosineAnnealingWarmRestarts(
        optimizer, T_0=args.epochs // 2 + 1, T_mult=1, eta_min=1e-6
    )

    best_mae = float("inf")
    history  = {"train_loss": [], "val_loss": [], "val_mae": [], "val_tier_acc": [], "val_unc": []}
    loss_weights = {
        "huber":   1.0,
        "attr":    0.4,
        "ranking": 0.3,
        "gauss":   0.2,
        "seg":     0.1,
    }

    print(f"[*] Starting training for {args.epochs} epochs...")
    for epoch in range(1, args.epochs + 1):
        model.train()
        running_loss = 0.0

        pbar = tqdm(train_loader, desc=f"Epoch {epoch}/{args.epochs}")
        for images, targets, attributes in pbar:
            images     = images.to(device)
            targets    = targets.to(device)
            attributes = attributes.to(device)

            optimizer.zero_grad()
            pred_sev, pred_lv, pred_attrs, water_mask = model(images)

            # 1. Huber regression loss (main severity)
            l_huber = criterion_huber(pred_sev, targets)

            # 2. Gaussian NLL uncertainty loss
            l_gauss = criterion_gauss(pred_sev, pred_lv, targets)

            # 3. Ordinal ranking loss (preserve ordering within batch)
            l_rank = criterion_ranking(pred_sev, targets)

            # 4. Attribute regression loss
            l_attr = criterion_attr(pred_attrs, attributes)

            # 5. Segmentation auxiliary loss (if water mask decoder active)
            l_seg = torch.tensor(0.0, device=device)
            if water_mask is not None:
                # Self-supervised: use high-severity images as pseudo-positives
                # (pixels in high-sev images should have high predicted water area)
                pseudo_target = (targets / 10.0).view(-1, 1, 1, 1).expand_as(water_mask)
                l_seg = F.binary_cross_entropy_with_logits(water_mask, pseudo_target.clamp(0, 1))

            loss = (
                loss_weights["huber"]   * l_huber +
                loss_weights["attr"]    * l_attr  +
                loss_weights["ranking"] * l_rank  +
                loss_weights["gauss"]   * l_gauss +
                loss_weights["seg"]     * l_seg
            )

            loss.backward()
            # Gradient clipping for training stability
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=2.0)
            optimizer.step()

            running_loss += loss.item() * len(targets)
            pbar.set_postfix({"loss": f"{loss.item():.4f}", "rank_l": f"{l_rank.item():.3f}"})

        scheduler.step()
        train_loss = running_loss / len(train_dataset)

        val_metrics = evaluate(model, val_loader, device)
        history["train_loss"].append(train_loss)
        history["val_loss"].append(val_metrics["val_loss"])
        history["val_mae"].append(val_metrics["mae"])
        history["val_tier_acc"].append(val_metrics["tier_accuracy"])
        history["val_unc"].append(val_metrics["mean_uncertainty"])

        print(
            f"Epoch {epoch:02d} | Train: {train_loss:.4f} | "
            f"Val MAE: {val_metrics['mae']:.2f}/10 | "
            f"Tier Acc: {val_metrics['tier_accuracy']*100:.1f}% | "
            f"Rank Corr: {val_metrics['spearman_rank_corr']:.2f} | "
            f"Unc: ±{val_metrics['mean_uncertainty']:.2f}"
        )

        if val_metrics["mae"] < best_mae:
            best_mae = val_metrics["mae"]
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_metrics": val_metrics,
                "backbone": args.backbone,
                "use_fpn": not args.no_fpn,
                "use_seg_head": not args.no_seg,
            }, os.path.join(args.output_dir, "best_model.pth"))
            print(f"  [+] New best → MAE: {best_mae:.2f}")

    # Save curves
    fig, axes = plt.subplots(1, 3, figsize=(16, 4.5))
    axes[0].plot(history["train_loss"], label="Train Loss")
    axes[0].plot(history["val_loss"], label="Val Loss")
    axes[0].set_title("Multi-Task Loss Curves")
    axes[0].set_xlabel("Epoch"); axes[0].legend(); axes[0].grid(alpha=0.3)

    axes[1].plot(history["val_mae"], color="orange", label="Val MAE (0–10)")
    axes[1].set_title("Validation MAE over Epochs")
    axes[1].set_xlabel("Epoch"); axes[1].legend(); axes[1].grid(alpha=0.3)

    axes[2].plot(history["val_unc"], color="purple", label="Mean Uncertainty (±σ)")
    axes[2].plot(history["val_tier_acc"], color="green", label="Tier Accuracy")
    axes[2].set_title("Uncertainty & Tier Accuracy")
    axes[2].set_xlabel("Epoch"); axes[2].legend(); axes[2].grid(alpha=0.3)

    plt.tight_layout()
    plt.savefig(os.path.join(args.output_dir, "training_curves.png"), dpi=200)
    plt.close()

    with open(os.path.join(args.output_dir, "metrics.json"), "w") as f:
        json.dump({"best_mae": best_mae, "history": history}, f, indent=2)

    print(f"[✓] Training complete. Best MAE: {best_mae:.2f}/10  →  {args.output_dir}/")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Improved Flood Severity Net v2")
    parser.add_argument("--data-csv",  type=str, required=True)
    parser.add_argument("--img-dir",   type=str, default=None)
    parser.add_argument("--backbone",  type=str, default="efficientnet_b2",
                        choices=["resnet18", "resnet50", "efficientnet_b0",
                                 "efficientnet_b2", "convnext_tiny"])
    parser.add_argument("--epochs",    type=int,   default=15)
    parser.add_argument("--batch-size",type=int,   default=16)
    parser.add_argument("--lr",        type=float, default=2e-4)
    parser.add_argument("--dropout",   type=float, default=0.3)
    parser.add_argument("--val-split", type=float, default=0.2)
    parser.add_argument("--img-size",  type=int,   default=224)
    parser.add_argument("--pretrained",action="store_true", default=True)
    parser.add_argument("--no-fpn",    action="store_true", default=False)
    parser.add_argument("--no-seg",    action="store_true", default=False)
    parser.add_argument("--output-dir",type=str,   default="checkpoints")
    args = parser.parse_args()
    train_model(args)
