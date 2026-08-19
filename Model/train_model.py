"""
Production-ready fine-tuning scaffold.
Run this when you have labelled flood images to significantly improve accuracy further.

Dataset format expected:
  data/
    train/
      1/  ← images with severity score 1
      2/
      ...
      10/
    val/
      1/
      ...
      10/

Even 50–100 labelled images per level will substantially improve calibration.
"""

import os
import logging
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from PIL import Image
from pathlib import Path

logger = logging.getLogger("train")
logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")


# ── Dataset ───────────────────────────────────────────────────────────────────
class FloodDataset(Dataset):
    """
    Loads images from directory structure: data/train/{1..10}/*.jpg
    Labels are derived from folder names (integer severity 1–10).
    """

    def __init__(self, root_dir: str, transform=None):
        self.samples: list[tuple[Path, float]] = []
        self.transform = transform
        root = Path(root_dir)
        for label_dir in sorted(root.iterdir()):
            if not label_dir.is_dir():
                continue
            try:
                score = float(label_dir.name)
                assert 1.0 <= score <= 10.0
            except (ValueError, AssertionError):
                continue
            for img_path in label_dir.glob("**/*.[jJpP][pPnN][gGgG]"):
                self.samples.append((img_path, score))
        logger.info("Dataset: %d images across %d levels", len(self.samples),
                    len({s for _, s in self.samples}))

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int):
        path, score = self.samples[idx]
        img = Image.open(path).convert("RGB")
        if self.transform:
            img = self.transform(img)
        # Normalise label to 0–1 range for MSE training
        return img, torch.tensor((score - 1.0) / 9.0, dtype=torch.float32)


# ── Flood-specific augmentations ──────────────────────────────────────────────
TRAIN_TRANSFORM = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.RandomCrop(224),
    transforms.RandomHorizontalFlip(),
    # Colour jitter simulates lighting variation across flood events
    transforms.ColorJitter(brightness=0.4, contrast=0.3, saturation=0.4, hue=0.08),
    transforms.RandomGrayscale(p=0.05),          # rare greyscale night images
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

VAL_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


# ── Model (same backbone as before, but head is fine-tuned) ───────────────────
class FloodSeverityNet(nn.Module):
    def __init__(self, pretrained: bool = True):
        super().__init__()
        weights = models.MobileNet_V3_Large_Weights.DEFAULT if pretrained else None
        self.backbone = models.mobilenet_v3_large(weights=weights)
        in_features = self.backbone.classifier[0].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Linear(in_features, 512),
            nn.Hardswish(),
            nn.Dropout(p=0.25),
            nn.Linear(512, 128),
            nn.Hardswish(),
            nn.Dropout(p=0.15),
            nn.Linear(128, 1),
            nn.Sigmoid(),   # outputs 0–1, mapped back to 1–10 at inference
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x).squeeze(-1)  # (batch,)


# ── Training loop ─────────────────────────────────────────────────────────────
def train(
    data_root: str = "data",
    output_path: str = "flood_severity_model.pth",
    epochs: int = 30,
    batch_size: int = 16,
    lr: float = 3e-4,
    freeze_backbone_epochs: int = 5,
):
    """
    Fine-tunes MobileNetV3 on your labelled flood dataset.

    Phase 1 (first `freeze_backbone_epochs` epochs):
        Only the custom head is trained (fast convergence).
    Phase 2 (remaining epochs):
        Full model unfrozen with lower LR (fine calibration).
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info("Training on %s", str(device).upper())

    train_ds = FloodDataset(os.path.join(data_root, "train"), TRAIN_TRANSFORM)
    val_ds = FloodDataset(os.path.join(data_root, "val"), VAL_TRANSFORM)

    if len(train_ds) == 0:
        logger.error(
            "No training images found in '%s/train/{1..10}/'. "
            "See dataset format in docstring.", data_root
        )
        return

    train_dl = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=2)
    val_dl = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=2)

    model = FloodSeverityNet(pretrained=True).to(device)
    criterion = nn.MSELoss()
    best_val_loss = float("inf")

    for epoch in range(1, epochs + 1):
        # Phase switch: freeze backbone for first N epochs
        if epoch == 1:
            for p in model.backbone.features.parameters():
                p.requires_grad = False
            logger.info("Epoch 1-%d: training head only (backbone frozen)", freeze_backbone_epochs)
            optimizer = optim.AdamW(
                filter(lambda p: p.requires_grad, model.parameters()), lr=lr
            )
            scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=freeze_backbone_epochs)

        elif epoch == freeze_backbone_epochs + 1:
            for p in model.backbone.features.parameters():
                p.requires_grad = True
            logger.info("Epoch %d+: full model unfrozen", epoch)
            optimizer = optim.AdamW(model.parameters(), lr=lr * 0.1)
            scheduler = optim.lr_scheduler.CosineAnnealingLR(
                optimizer, T_max=epochs - freeze_backbone_epochs
            )

        # ── Train ──
        model.train()
        train_loss = 0.0
        for imgs, labels in train_dl:
            imgs, labels = imgs.to(device), labels.to(device)
            optimizer.zero_grad()
            preds = model(imgs)
            loss = criterion(preds, labels)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * len(imgs)
        train_loss /= len(train_ds)
        scheduler.step()

        # ── Validate ──
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for imgs, labels in val_dl:
                imgs, labels = imgs.to(device), labels.to(device)
                preds = model(imgs)
                val_loss += criterion(preds, labels).item() * len(imgs)
        val_loss /= max(len(val_ds), 1)

        # MAE in original 1–10 scale
        train_mae = (train_loss ** 0.5) * 9.0
        val_mae = (val_loss ** 0.5) * 9.0

        logger.info(
            "Epoch %2d/%d  train_MAE=%.3f  val_MAE=%.3f",
            epoch, epochs, train_mae, val_mae,
        )

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), output_path)
            logger.info("  ✓ Best model saved → %s", output_path)

    logger.info(
        "Training complete. Best val MAE: %.3f on 1–10 scale.",
        (best_val_loss ** 0.5) * 9.0,
    )


if __name__ == "__main__":
    train()
