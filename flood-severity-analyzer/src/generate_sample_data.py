"""
Sample dataset generator for Flood Severity Assessment.
Creates a balanced sample dataset across all severity tiers (0.0 to 10.0)
with simulated flood features (water level, vehicle submersion, structural hazard)
and outputs a training CSV annotations file.
"""

import argparse
import os
import numpy as np
import pandas as pd
from PIL import Image, ImageDraw, ImageFilter


def create_synthetic_flood_image(severity_score: float, width: int = 400, height: int = 300) -> Image.Image:
    """
    Synthesizes a flood scene corresponding to the given severity score (0.0 to 10.0).
    Renders realistic street, building, vehicle, and water-level visual features.
    """
    img = Image.new("RGB", (width, height))
    draw = ImageDraw.Draw(img)

    # 1. Background Sky & Atmosphere (Stormy vs clear depending on severity)
    storminess = severity_score / 10.0
    sky_r = int(140 * (1 - storminess * 0.5))
    sky_g = int(160 * (1 - storminess * 0.5))
    sky_b = int(180 * (1 - storminess * 0.4))
    draw.rectangle([0, 0, width, height // 2], fill=(sky_r, sky_g, sky_b))

    # 2. Buildings in the background
    draw.rectangle([30, int(height * 0.25), 140, int(height * 0.85)], fill=(110, 105, 100))
    # Windows
    for wy in range(int(height * 0.3), int(height * 0.75), 35):
        for wx in range(45, 125, 30):
            draw.rectangle([wx, wy, wx + 18, wy + 22], fill=(220, 215, 180) if storminess > 0.5 else (240, 240, 200))

    # Second building
    draw.rectangle([260, int(height * 0.2), 370, int(height * 0.85)], fill=(130, 120, 115))
    for wy in range(int(height * 0.25), int(height * 0.75), 35):
        for wx in range(275, 355, 30):
            draw.rectangle([wx, wy, wx + 18, wy + 22], fill=(200, 210, 220))

    # 3. Ground / Road base
    draw.rectangle([0, int(height * 0.65), width, height], fill=(70, 70, 72))

    # 4. Vehicle in center-right
    car_x = int(width * 0.42)
    car_y = int(height * 0.68)
    car_w = 90
    car_h = 45
    # Car body
    draw.rectangle([car_x, car_y, car_x + car_w, car_y + car_h], fill=(180, 40, 40))
    # Car roof / cabin
    draw.rectangle([car_x + 15, car_y - 20, car_x + car_w - 20, car_y], fill=(160, 35, 35))
    # Car windows
    draw.rectangle([car_x + 20, car_y - 17, car_x + car_w - 25, car_y - 2], fill=(180, 200, 220))
    # Wheels
    draw.ellipse([car_x + 10, car_y + car_h - 10, car_x + 30, car_y + car_h + 10], fill=(20, 20, 20))
    draw.ellipse([car_x + car_w - 30, car_y + car_h - 10, car_x + car_w - 10, car_y + car_h + 10], fill=(20, 20, 20))

    # 5. Flood Water Overlay based on Severity Score (0.0 - 10.0)
    # At severity 0.5: small puddles on road
    # At severity 3.5: water covers wheels (shin deep)
    # At severity 6.5: water covers car hood/doors (waist deep)
    # At severity 9.5: water covers buildings ground floors and car roof
    water_height_ratio = (severity_score / 10.0) ** 1.15
    water_top = int(height - water_height_ratio * (height * 0.65))
    water_top = min(height - 1, max(int(height * 0.35), water_top))

    # Water color: turbid murky brown/gray flood water
    turbidity = min(1.0, severity_score / 6.0)
    w_r = int(60 * (1 - turbidity) + 115 * turbidity)
    w_g = int(85 * (1 - turbidity) + 95 * turbidity)
    w_b = int(105 * (1 - turbidity) + 70 * turbidity)

    if severity_score > 0.5:
        # Create transparent water overlay
        water_overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        w_draw = ImageDraw.Draw(water_overlay)
        
        # Base water block
        alpha = int(140 + 100 * min(1.0, severity_score / 5.0))
        w_draw.rectangle([0, water_top, width, height], fill=(w_r, w_g, w_b, alpha))

        # Add water ripples / surface lines
        for y_ripple in range(water_top, height, 12):
            wave_offset = np.random.randint(-15, 15)
            w_draw.line(
                [0, y_ripple + wave_offset // 3, width, y_ripple - wave_offset // 3],
                fill=(w_r + 25, w_g + 25, w_b + 20, int(alpha * 0.7)),
                width=2
            )

        # Debris if high severity
        if severity_score > 6.0:
            for _ in range(int((severity_score - 5.0) * 3)):
                dx = np.random.randint(20, width - 40)
                dy = np.random.randint(water_top + 10, height - 10)
                w_draw.rectangle([dx, dy, dx + 20, dy + 6], fill=(70, 45, 20, 220))

        img = Image.alpha_composite(img.convert("RGBA"), water_overlay).convert("RGB")

    # Slight camera storm blur / noise
    if severity_score > 4.0:
        img = img.filter(ImageFilter.GaussianBlur(radius=0.4))

    return img


def generate_sample_dataset(output_dir: str, num_samples: int = 120):
    images_dir = os.path.join(output_dir, "images")
    os.makedirs(images_dir, exist_ok=True)

    records = []
    print(f"[*] Generating {num_samples} sample flood images with ground truth severity across tiers...")

    # Generate evenly distributed scores across 0.2 to 9.8
    scores = np.linspace(0.3, 9.7, num_samples)
    # Add minor random noise
    scores = np.clip(scores + np.random.uniform(-0.25, 0.25, num_samples), 0.1, 9.9)

    for i, score in enumerate(scores):
        filename = f"flood_sample_{i:04d}.jpg"
        filepath = os.path.join(images_dir, filename)

        img = create_synthetic_flood_image(severity_score=score)
        img.save(filepath, quality=90)

        # Compute realistic feature attributes matching physical visual features
        water_depth = round(min(10.0, score * np.random.uniform(0.95, 1.05)), 2)
        vehicle_risk = round(min(10.0, max(0.0, (score - 2.0) * 1.35 + np.random.uniform(-0.3, 0.3))), 2) if score > 2.0 else 0.0
        structural_risk = round(min(10.0, max(0.0, (score - 4.5) * 1.8 + np.random.uniform(-0.4, 0.4))), 2) if score > 4.5 else 0.0

        records.append({
            "image_path": os.path.join("images", filename),
            "severity_score": round(float(score), 2),
            "water_depth": float(water_depth),
            "vehicle_risk": float(vehicle_risk),
            "structural_risk": float(structural_risk),
        })

    csv_path = os.path.join(output_dir, "annotations.csv")
    df = pd.DataFrame(records)
    df.to_csv(csv_path, index=False)
    print(f"[✓] Generated dataset saved to {output_dir}")
    print(f"    - Images: {len(df)} in {images_dir}")
    print(f"    - Annotations: {csv_path}")
    print(f"    - Score distribution: min={df['severity_score'].min():.1f}, mean={df['severity_score'].mean():.1f}, max={df['severity_score'].max():.1f}")
    return csv_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=str, default="data", help="Output directory")
    parser.add_argument("--num-samples", type=int, default=120, help="Number of samples to generate")
    args = parser.parse_args()
    generate_sample_dataset(args.output_dir, args.num_samples)
