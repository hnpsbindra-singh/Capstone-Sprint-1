"""
Temporal & Differential Flood Analysis (Change Detection).
Compares a reference dry / normal weather baseline image against a flooded scene.
Computes water area difference, ground feature disappearance, and depth delta.
"""

import os
import cv2
import numpy as np
from PIL import Image
import torch


def compute_differential_flood_analysis(
    dry_image: np.ndarray,
    flood_image: np.ndarray,
    img_size: int = 300,
) -> dict:
    """
    Performs change detection between a dry reference baseline and a flooded frame.
    
    Returns:
      inundated_pixel_ratio: float (0.0 to 1.0)
      water_delta_score: float (0.0 to 10.0 scale)
      differential_heatmap: np.ndarray (RGB heatmap showing water inundation zones)
      side_by_side_vis: np.ndarray (visual side-by-side composite)
    """
    # Resize both to standard comparative grid
    dry_resized = cv2.resize(dry_image, (img_size, img_size))
    flood_resized = cv2.resize(flood_image, (img_size, img_size))

    # Convert to grayscale & blur
    dry_gray = cv2.cvtColor(dry_resized, cv2.COLOR_RGB2GRAY)
    flood_gray = cv2.cvtColor(flood_resized, cv2.COLOR_RGB2GRAY)

    dry_blur = cv2.GaussianBlur(dry_gray, (7, 7), 0)
    flood_blur = cv2.GaussianBlur(flood_gray, (7, 7), 0)

    # Frame absolute difference
    frame_diff = cv2.absdiff(dry_blur, flood_blur)

    # Chromatic difference in lower 60% of frame (road/ground plane)
    dry_lab = cv2.cvtColor(dry_resized, cv2.COLOR_RGB2LAB)
    flood_lab = cv2.cvtColor(flood_resized, cv2.COLOR_RGB2LAB)
    chroma_diff = np.sqrt(
        (dry_lab[:, :, 1].astype(float) - flood_lab[:, :, 1].astype(float)) ** 2 +
        (dry_lab[:, :, 2].astype(float) - flood_lab[:, :, 2].astype(float)) ** 2
    )

    # Combine intensity difference and chromatic turbid water shift
    combined_diff = 0.5 * (frame_diff.astype(float) / 255.0) + 0.5 * (chroma_diff / 80.0)
    combined_diff = np.clip(combined_diff, 0.0, 1.0)

    # Emphasize lower half of image (hydrologic ground plane)
    y_weights = np.linspace(0.2, 1.2, img_size)[:, None]
    weighted_diff = combined_diff * y_weights
    weighted_diff = np.clip(weighted_diff, 0.0, 1.0)

    # Threshold for flooded area mask
    water_mask = weighted_diff > 0.28
    inundated_ratio = float(np.mean(water_mask[int(img_size * 0.4):, :]))

    # Compute delta severity on 0-10 scale
    delta_score = round(float(np.clip(inundated_ratio * 11.5, 0.0, 10.0)), 2)

    # Create visualization
    heatmap_colored = cv2.applyColorMap(np.uint8(255 * weighted_diff), cv2.COLORMAP_TURBO)
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
    overlay = np.uint8(0.6 * flood_resized + 0.4 * heatmap_colored)

    # Side-by-side composite: [Dry Baseline | Current Flooded | Differential Water Delta]
    composite = np.hstack([dry_resized, flood_resized, overlay])

    return {
        "inundated_ratio_ground": round(inundated_ratio * 100, 1),
        "delta_severity_score": delta_score,
        "composite_image": composite,
        "differential_overlay": overlay,
    }
