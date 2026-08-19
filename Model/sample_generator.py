"""
Generates realistic synthetic test images to validate scoring accuracy.

Expected scores (what the model SHOULD return):
  dry_library.jpg          → 1   (no flood)
  dry_road_sunny.jpg       → 1   (no flood)
  small_puddle.jpg         → 2   (negligible)
  ankle_deep_flood.jpg     → 4-5 (minor)
  moderate_urban_flood.jpg → 6   (moderate)
  severe_flood.jpg         → 8-9 (severe)
  catastrophic_flood.jpg   → 9-10 (catastrophic)
"""

import os
import sys
import numpy as np

try:
    import cv2
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False
    print("cv2 not found — install with: pip install opencv-python-headless")
    sys.exit(1)


OUTPUT_DIR = "sample_images"


def _save(name: str, img: np.ndarray) -> None:
    path = os.path.join(OUTPUT_DIR, name)
    cv2.imwrite(path, img)
    print(f"  [OK] {name}")


def generate_all() -> None:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Generating test images into '{os.path.abspath(OUTPUT_DIR)}':\n")

    W, H = 640, 480

    # ── 1. Dry Library (score → 1) ────────────────────────────────────────────
    # High-texture brown wooden surfaces — must NOT trigger water detection
    img = np.full((H, W, 3), (55, 80, 110), dtype=np.uint8)  # dark wall
    for x in range(0, W, 45):                                  # bookshelves
        cv2.rectangle(img, (x, 60), (x + 38, H - 60), (35, 55, 80), -1)
        for y in range(80, H - 80, 28):                        # book spines
            colour = (
                np.random.randint(20, 200),
                np.random.randint(20, 200),
                np.random.randint(20, 200),
            )
            cv2.rectangle(img, (x + 2, y), (x + 36, y + 22), colour, -1)
    cv2.rectangle(img, (0, H - 60), (W, H), (60, 45, 35), -1)  # floor
    # Add noise texture (bookshelves have high variance)
    noise = np.random.randint(-18, 18, img.shape, dtype=np.int16)
    img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    _save("dry_library.jpg", img)

    # ── 2. Dry Road Sunny Day (score → 1) ─────────────────────────────────────
    img = np.full((H, W, 3), (120, 160, 210), dtype=np.uint8)  # sky (BGR)
    cv2.rectangle(img, (0, int(H * 0.45)), (W, H), (80, 80, 80), -1)       # asphalt
    cv2.rectangle(img, (0, int(H * 0.40)), (W, int(H * 0.45)), (70, 130, 50), -1)  # verge
    # Road markings
    for y in range(int(H * 0.5), H, 40):
        cv2.rectangle(img, (W // 2 - 5, y), (W // 2 + 5, y + 20), (220, 220, 220), -1)
    _save("dry_road_sunny.jpg", img)

    # ── 3. Small Puddle Only (score → 2) ──────────────────────────────────────
    img = np.full((H, W, 3), (90, 90, 90), dtype=np.uint8)   # asphalt
    # One small reflective puddle  (smooth, blue-ish, small)
    cx, cy = W // 2, int(H * 0.7)
    axes = (80, 30)
    # Smooth gradient fill for puddle
    for r in range(min(axes), 0, -1):
        alpha = r / min(axes)
        color = (
            int(60 + 60 * alpha),
            int(80 + 40 * alpha),
            int(40 + 20 * alpha),
        )
        cv2.ellipse(img, (cx, cy), (int(axes[0] * r / min(axes)), int(axes[1] * r / min(axes))), 0, 0, 360, color, -1)
    _save("small_puddle.jpg", img)

    # ── 4. Ankle-Deep Flood (score → 4-5) ────────────────────────────────────
    img = np.full((H, W, 3), (100, 150, 200), dtype=np.uint8)  # sky
    cv2.rectangle(img, (0, int(H * 0.4)), (W, int(H * 0.55)), (80, 110, 60), -1)   # buildings bg
    # Buildings
    for bx in range(0, W, 100):
        bh = np.random.randint(60, 120)
        cv2.rectangle(img, (bx, int(H * 0.4) - bh), (bx + 80, int(H * 0.55)), (140, 140, 160), -1)
    # Flood water: lower 45%, brownish, SMOOTH
    water_color = (50, 90, 130)  # BGR brown
    cv2.rectangle(img, (0, int(H * 0.55)), (W, H), water_color, -1)
    # Add gentle horizontal texture (reflections) — keep smooth
    for y in range(int(H * 0.57), H, 12):
        alpha = np.random.uniform(0.05, 0.15)
        cv2.line(img, (0, y), (W, y), (60, 100, 140), 1)
    _save("ankle_deep_flood.jpg", img)

    # ── 5. Moderate Urban Flood (score → 6) ──────────────────────────────────
    img = np.full((H, W, 3), (90, 120, 160), dtype=np.uint8)  # overcast sky
    # Buildings half-submerged
    for bx in range(0, W, 110):
        bh = np.random.randint(100, 160)
        cv2.rectangle(img, (bx, int(H * 0.15)), (bx + 90, int(H * 0.50)), (130, 130, 150), -1)
        # Windows
        for wy in range(int(H * 0.18), int(H * 0.45), 30):
            cv2.rectangle(img, (bx + 10, wy), (bx + 40, wy + 20), (200, 220, 255), -1)
    # Knee-deep brownish flood water (lower 50%)
    water_top = int(H * 0.50)
    flood = np.full((H - water_top, W, 3), (45, 78, 115), dtype=np.uint8)
    # Smooth ripple lines
    for y in range(0, H - water_top, 10):
        cv2.line(flood, (0, y), (W, y), (50, 85, 120), 1)
    img[water_top:, :] = flood
    # A partially submerged car
    cv2.rectangle(img, (200, int(H * 0.62)), (350, int(H * 0.78)), (60, 60, 80), -1)
    cv2.rectangle(img, (220, int(H * 0.55)), (330, int(H * 0.63)), (50, 50, 70), -1)
    _save("moderate_urban_flood.jpg", img)

    # ── 6. Severe Flood (score → 8-9) ────────────────────────────────────────
    img = np.full((H, W, 3), (60, 80, 100), dtype=np.uint8)  # dark stormy sky
    # Only rooftops and upper storeys visible
    for bx in range(0, W, 120):
        roof_h = np.random.randint(20, 60)
        cv2.rectangle(img, (bx, int(H * 0.10)), (bx + 100, int(H * 0.30)), (100, 100, 120), -1)
        # Roof peak
        pts = np.array([[bx, int(H * 0.10)], [bx + 50, int(H * 0.10) - roof_h], [bx + 100, int(H * 0.10)]])
        cv2.fillPoly(img, [pts], (80, 60, 50))
    # Deep dark brown floodwater (lower 70%)
    water_top = int(H * 0.30)
    img[water_top:, :] = (35, 60, 95)
    # Debris floating in water
    for _ in range(20):
        dx = np.random.randint(0, W)
        dy = np.random.randint(water_top + 10, H - 10)
        cv2.rectangle(img, (dx, dy), (dx + np.random.randint(15, 50), dy + np.random.randint(5, 15)),
                      (25, 45, 70), -1)
    # Smooth water surface (important for detection)
    for y in range(water_top, H, 8):
        cv2.line(img, (0, y), (W, y), (38, 65, 100), 1)
    _save("severe_flood.jpg", img)

    # ── 7. Catastrophic Flood (score → 9-10) ─────────────────────────────────
    img = np.full((H, W, 3), (40, 55, 75), dtype=np.uint8)   # storm sky
    # Just tips of trees/antennas visible
    for tx in range(50, W, 90):
        cv2.line(img, (tx, int(H * 0.05)), (tx, int(H * 0.22)), (30, 50, 30), 2)
        # Small treetop
        cv2.circle(img, (tx, int(H * 0.05)), 15, (20, 60, 20), -1)
    # Almost everything underwater — 78% of image is floodwater
    water_top = int(H * 0.22)
    img[water_top:, :] = (30, 52, 80)
    # Choppy water surface
    for y in range(water_top, H, 6):
        offset = np.random.randint(-3, 3)
        cv2.line(img, (0, y + offset), (W, y + offset), (35, 58, 88), 1)
    # Large floating debris (cars, wood)
    for _ in range(8):
        dx = np.random.randint(0, W - 80)
        dy = np.random.randint(water_top + 20, H - 30)
        cv2.rectangle(img, (dx, dy), (dx + 70, dy + 25), (20, 35, 55), -1)
    _save("catastrophic_flood.jpg", img)

    print(
        "\nDone! Run the API then test with:\n"
        "  curl -X POST http://localhost:8000/api/v1/analyze -F file=@sample_images/dry_library.jpg\n"
        "  curl -X POST http://localhost:8000/api/v1/analyze -F file=@sample_images/severe_flood.jpg\n"
    )


if __name__ == "__main__":
    generate_all()
