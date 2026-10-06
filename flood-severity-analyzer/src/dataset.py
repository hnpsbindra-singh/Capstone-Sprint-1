"""
IMPROVED Dataset module for Flood Severity Assessment.

Improvements over v1:
  - Flood-specific augmentations: rain streaks, turbid water tone, mud debris,
    heavy blur (storm camera shake), Gaussian soft label smoothing
  - Class-balanced WeightedRandomSampler for rare extreme samples
  - Support for optional water_mask ground truth annotation
"""

import os
import random
from typing import Callable, Optional, Tuple
import numpy as np
import pandas as pd
from PIL import Image, ImageDraw, ImageFilter
import torch
from torch.utils.data import Dataset, WeightedRandomSampler
import torchvision.transforms as T
import torchvision.transforms.functional as TF


def get_severity_category(score: float) -> str:
    """Categorizes a 0.0-10.0 severity score into standard hazard tiers."""
    if score < 2.5:
        return "Low (Minor puddling / walkable)"
    elif score < 5.0:
        return "Moderate (Shin-deep / impassable for cars)"
    elif score < 7.5:
        return "High (Knee-waist deep / vehicles submerged)"
    else:
        return "Extreme (Structural damage / roof-level flood)"


# ---------------------------------------------------------------------------
# Flood-Specific Augmentation Transforms
# ---------------------------------------------------------------------------
class AddRainStreaks:
    """Overlays semi-transparent diagonal rain streaks on image tensor."""
    def __init__(self, p: float = 0.4, intensity: float = 0.25):
        self.p = p
        self.intensity = intensity

    def __call__(self, img: Image.Image) -> Image.Image:
        if random.random() > self.p:
            return img
        w, h = img.size
        rain_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(rain_layer)
        num_streaks = random.randint(40, 120)
        for _ in range(num_streaks):
            x = random.randint(0, w)
            y = random.randint(0, h)
            length = random.randint(8, 25)
            alpha = random.randint(80, 160)
            draw.line([(x, y), (x + 3, y + length)], fill=(200, 210, 230, alpha), width=1)
        return Image.alpha_composite(img.convert("RGBA"), rain_layer).convert("RGB")


class TurbidWaterTone:
    """
    Shifts image color toward muddy brown-grey tones found in flood water.
    Simulates turbidity variation across flood severity levels.
    """
    def __init__(self, p: float = 0.45):
        self.p = p

    def __call__(self, img: Image.Image) -> Image.Image:
        if random.random() > self.p:
            return img
        arr = np.array(img, dtype=np.float32)
        # Random brown/grey cast — R channel boost, B channel decrease
        r_shift = random.uniform(0.9, 1.15)
        g_shift = random.uniform(0.85, 1.05)
        b_shift = random.uniform(0.7, 0.95)
        arr[:, :, 0] = np.clip(arr[:, :, 0] * r_shift, 0, 255)
        arr[:, :, 1] = np.clip(arr[:, :, 1] * g_shift, 0, 255)
        arr[:, :, 2] = np.clip(arr[:, :, 2] * b_shift, 0, 255)
        return Image.fromarray(arr.astype(np.uint8))


class AddMudDebris:
    """
    Overlays small dark debris patches simulating flood-borne mud and debris.
    More patches at higher severity levels.
    """
    def __init__(self, p: float = 0.35, max_patches: int = 8):
        self.p = p
        self.max_patches = max_patches

    def __call__(self, img: Image.Image) -> Image.Image:
        if random.random() > self.p:
            return img
        draw = ImageDraw.Draw(img)
        w, h = img.size
        for _ in range(random.randint(2, self.max_patches)):
            x = random.randint(0, w - 30)
            y = random.randint(h // 2, h - 10)
            pw = random.randint(6, 28)
            ph = random.randint(3, 10)
            shade = random.randint(40, 90)
            draw.rectangle([x, y, x + pw, y + ph], fill=(shade, shade - 10, shade - 20))
        return img


class StormBlur:
    """Camera shake / rain blur simulating poor visibility during storms."""
    def __init__(self, p: float = 0.3, max_radius: float = 1.5):
        self.p = p
        self.max_radius = max_radius

    def __call__(self, img: Image.Image) -> Image.Image:
        if random.random() > self.p:
            return img
        r = random.uniform(0.4, self.max_radius)
        return img.filter(ImageFilter.GaussianBlur(radius=r))


def get_transforms(split: str = "train", img_size: int = 224) -> Callable:
    """
    Returns improved image transformation pipeline.
    Training: flood-specific augmentations + standard geometric augments.
    Val/Test: deterministic resize + normalize only.
    """
    mean = [0.485, 0.456, 0.406]
    std  = [0.229, 0.224, 0.225]

    if split == "train":
        return T.Compose([
            T.Resize((img_size + 32, img_size + 32)),
            T.RandomResizedCrop(img_size, scale=(0.75, 1.0)),
            T.RandomHorizontalFlip(p=0.5),
            T.RandomVerticalFlip(p=0.1),
            T.RandomRotation(degrees=10),
            T.ColorJitter(brightness=0.25, contrast=0.25, saturation=0.25, hue=0.06),
            T.RandomPerspective(distortion_scale=0.15, p=0.3),
            AddRainStreaks(p=0.4),
            TurbidWaterTone(p=0.45),
            AddMudDebris(p=0.35),
            StormBlur(p=0.3),
            T.ToTensor(),
            T.Normalize(mean=mean, std=std),
            T.RandomErasing(p=0.15, scale=(0.02, 0.08)),  # occlusion simulation
        ])
    else:
        return T.Compose([
            T.Resize((img_size, img_size)),
            T.ToTensor(),
            T.Normalize(mean=mean, std=std),
        ])


def get_tta_transforms(img_size: int = 224, n_augments: int = 6) -> list:
    """
    Returns a list of deterministic TTA transforms applied at inference time.
    Each is a separate pipeline for a different augmentation view.
    """
    mean = [0.485, 0.456, 0.406]
    std  = [0.229, 0.224, 0.225]
    base = [T.Resize((img_size, img_size)), T.ToTensor(), T.Normalize(mean, std)]

    augments = [
        T.Compose(base),
        T.Compose([T.Resize((img_size, img_size)), T.RandomHorizontalFlip(p=1.0), T.ToTensor(), T.Normalize(mean, std)]),
        T.Compose([T.Resize((img_size + 16, img_size + 16)), T.CenterCrop(img_size), T.ToTensor(), T.Normalize(mean, std)]),
        T.Compose([T.Resize((img_size, img_size)), T.ColorJitter(brightness=0.1), T.ToTensor(), T.Normalize(mean, std)]),
        T.Compose([T.Resize((img_size, img_size)), T.ColorJitter(contrast=0.1), T.ToTensor(), T.Normalize(mean, std)]),
        T.Compose([T.Resize((img_size, img_size)), T.RandomRotation(degrees=5), T.CenterCrop(img_size), T.ToTensor(), T.Normalize(mean, std)]),
    ]
    return augments[:n_augments]


# ---------------------------------------------------------------------------
# Soft Label Smoothing
# ---------------------------------------------------------------------------
def smooth_severity_label(score: float, sigma: float = 0.3) -> float:
    """
    Adds tiny Gaussian noise to simulate annotator uncertainty / label noise.
    Prevents overconfident score memorization by the network.
    """
    return float(np.clip(score + np.random.normal(0, sigma), 0.0, 10.0))


# ---------------------------------------------------------------------------
# FloodDataset
# ---------------------------------------------------------------------------
class FloodDataset(Dataset):
    """
    Improved PyTorch Dataset for Flood Severity Estimation.

    CSV must include:
      - image_path (str)
      - severity_score (float, 0.0 - 10.0)

    Optional columns:
      - water_depth, vehicle_risk, structural_risk (float, 0.0 - 10.0)
      - water_mask_path (str): path to binary water mask image (0/255)

    Args:
        soft_labels: Apply Gaussian noise to severity scores during training.
        soft_label_sigma: Std of the Gaussian noise applied to labels.
    """
    def __init__(
        self,
        dataframe: pd.DataFrame,
        img_dir: Optional[str] = None,
        transform: Optional[Callable] = None,
        soft_labels: bool = False,
        soft_label_sigma: float = 0.3,
    ):
        self.df = dataframe.reset_index(drop=True)
        self.img_dir = img_dir
        self.transform = transform or get_transforms(split="val")
        self.soft_labels = soft_labels
        self.soft_label_sigma = soft_label_sigma

        if "image_path" not in self.df.columns or "severity_score" not in self.df.columns:
            raise ValueError("Dataframe must contain 'image_path' and 'severity_score' columns.")

        self.df["severity_score"] = self.df["severity_score"].clip(0.0, 10.0).astype(float)

        self.has_attributes = all(
            col in self.df.columns for col in ["water_depth", "vehicle_risk", "structural_risk"]
        )
        self.has_mask = "water_mask_path" in self.df.columns

    def __len__(self) -> int:
        return len(self.df)

    def __getitem__(self, idx: int) -> tuple:
        row = self.df.iloc[idx]
        img_path = str(row["image_path"])
        if self.img_dir and not os.path.isabs(img_path):
            img_path = os.path.join(self.img_dir, img_path)

        if not os.path.exists(img_path):
            raise FileNotFoundError(f"Flood image not found: {img_path}")

        image = Image.open(img_path).convert("RGB")
        if self.transform:
            image = self.transform(image)

        # Severity score with optional soft label smoothing
        raw_score = float(row["severity_score"])
        if self.soft_labels:
            raw_score = smooth_severity_label(raw_score, self.soft_label_sigma)
        severity = torch.tensor(raw_score, dtype=torch.float32)

        # Feature attributes
        if self.has_attributes:
            attributes = torch.tensor([
                float(row["water_depth"]),
                float(row["vehicle_risk"]),
                float(row["structural_risk"]),
            ], dtype=torch.float32)
        else:
            base = float(row["severity_score"])
            attributes = torch.tensor([
                base,
                max(0.0, min(10.0, base * 1.05 - 0.5)),
                max(0.0, min(10.0, base * 0.95 - 1.0 if base < 5 else base * 1.1)),
            ], dtype=torch.float32)

        return image, severity, attributes


def make_balanced_sampler(dataset: FloodDataset) -> WeightedRandomSampler:
    """
    Creates a WeightedRandomSampler that upsamples rare extreme-severity images.
    Assigns inverse-frequency weights per hazard tier.
    Corrects severe class imbalance where minor floods dominate most real datasets.
    """
    scores = dataset.df["severity_score"].values
    # Assign tier index: 0=Low, 1=Moderate, 2=High, 3=Extreme
    tiers = np.digitize(scores, bins=[2.5, 5.0, 7.5]) 
    tier_counts = np.bincount(tiers, minlength=4).astype(float)
    tier_counts = np.where(tier_counts == 0, 1.0, tier_counts)
    tier_weights = 1.0 / tier_counts
    sample_weights = torch.tensor([tier_weights[t] for t in tiers], dtype=torch.float64)
    return WeightedRandomSampler(
        weights=sample_weights,
        num_samples=len(dataset),
        replacement=True,
    )
