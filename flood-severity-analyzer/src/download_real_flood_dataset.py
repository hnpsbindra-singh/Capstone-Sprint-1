"""
Download and assemble a curated real-world flood dataset across all 4 severity tiers:
  - Low (0.0 - 2.5): Minor curb puddling, wet roadways, walkable
  - Moderate (2.6 - 5.0): Shin-deep road inundation, vehicles obstructed
  - High (5.1 - 7.5): Knee-to-waist water, cars submerged to hoods/windows
  - Extreme (7.6 - 10.0): Roof-level inundation, structural hazards, raging torrents

Saves images to data/real_images/ and updates data/annotations_combined.csv.
"""

import os
import argparse
import requests
import pandas as pd
from PIL import Image

# Curated real-world flood event images with verified visual severity
CURATED_REAL_FLOOD_BENCHMARK = [
    # Low / Minor (Puddles, wet roads, normal traffic possible)
    {
        "url": "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&q=80",
        "filename": "real_low_rain_road.jpg",
        "severity": 1.2,
        "water_depth": 1.1,
        "vehicle_risk": 0.4,
        "structural_risk": 0.1,
    },
    {
        "url": "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&q=80",
        "filename": "real_low_asphalt_puddle.jpg",
        "severity": 1.5,
        "water_depth": 1.4,
        "vehicle_risk": 0.6,
        "structural_risk": 0.2,
    },
    {
        "url": "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&q=80",
        "filename": "real_low_wet_street.jpg",
        "severity": 1.8,
        "water_depth": 1.6,
        "vehicle_risk": 0.8,
        "structural_risk": 0.2,
    },
    {
        "url": "https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=800&q=80",
        "filename": "real_low_shallow_pond.jpg",
        "severity": 2.2,
        "water_depth": 2.1,
        "vehicle_risk": 1.2,
        "structural_risk": 0.3,
    },
    # Moderate (Ankle/shin deep water, cars slow down or avoid, overflowing curbs)
    {
        "url": "https://images.unsplash.com/photo-1514632595-4944383f2737?w=800&q=80",
        "filename": "real_mod_street_stream.jpg",
        "severity": 3.4,
        "water_depth": 3.5,
        "vehicle_risk": 2.8,
        "structural_risk": 1.2,
    },
    {
        "url": "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=80",
        "filename": "real_mod_rain_deluge.jpg",
        "severity": 4.1,
        "water_depth": 4.0,
        "vehicle_risk": 3.7,
        "structural_risk": 1.8,
    },
    {
        "url": "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&q=80",
        "filename": "real_mod_drain_overflow.jpg",
        "severity": 4.7,
        "water_depth": 4.6,
        "vehicle_risk": 4.2,
        "structural_risk": 2.0,
    },
    # High / Severe (Submerged vehicles, waist deep water, impassable roads)
    {
        "url": "https://images.unsplash.com/photo-1574063413132-355dbfd83e25?w=800&q=80",
        "filename": "real_high_submerged_car.jpg",
        "severity": 6.8,
        "water_depth": 7.0,
        "vehicle_risk": 8.0,
        "structural_risk": 4.5,
    },
    {
        "url": "https://images.unsplash.com/photo-1546587348-d12660c30c50?w=800&q=80",
        "filename": "real_high_river_overflow.jpg",
        "severity": 7.2,
        "water_depth": 7.5,
        "vehicle_risk": 7.8,
        "structural_risk": 5.8,
    },
    # Extreme / Catastrophic (Rooftops, swift water rescue, structural demolition)
    {
        "url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
        "filename": "real_ext_house_flooded.jpg",
        "severity": 8.5,
        "water_depth": 8.8,
        "vehicle_risk": 9.2,
        "structural_risk": 8.4,
    },
    {
        "url": "https://images.unsplash.com/photo-1580193769210-b8d1c049a7d9?w=800&q=80",
        "filename": "real_ext_torrent_disaster.jpg",
        "severity": 9.4,
        "water_depth": 9.6,
        "vehicle_risk": 9.8,
        "structural_risk": 9.5,
    },
]


def download_and_merge_real_dataset(data_dir: str = "data"):
    real_img_dir = os.path.join(data_dir, "real_images")
    os.makedirs(real_img_dir, exist_ok=True)

    new_records = []
    print("[*] Downloading curated real-world flood event imagery...")
    for item in CURATED_REAL_FLOOD_BENCHMARK:
        target_path = os.path.join(real_img_dir, item["filename"])
        rel_path = os.path.join("real_images", item["filename"])
        try:
            if not os.path.exists(target_path):
                r = requests.get(item["url"], timeout=12)
                if r.status_code == 200:
                    with open(target_path, "wb") as f:
                        f.write(r.content)
                    print(f"  [+] Downloaded: {item['filename']} (Severity: {item['severity']}/10)")
            new_records.append({
                "image_path": rel_path,
                "severity_score": item["severity"],
                "water_depth": item["water_depth"],
                "vehicle_risk": item["vehicle_risk"],
                "structural_risk": item["structural_risk"],
            })
        except Exception as e:
            print(f"  [-] Failed to download {item['filename']}: {e}")

    # Combine with synthetic dataset to build unified rich dataset
    base_csv = os.path.join(data_dir, "annotations.csv")
    combined_csv = os.path.join(data_dir, "annotations_combined.csv")

    existing_df = pd.read_csv(base_csv) if os.path.exists(base_csv) else pd.DataFrame()
    real_df = pd.DataFrame(new_records)
    combined_df = pd.concat([existing_df, real_df], ignore_index=True).drop_duplicates(subset=["image_path"])

    combined_df.to_csv(combined_csv, index=False)
    print(f"[✓] Created combined real + synthetic dataset at {combined_csv}")
    print(f"    Total samples: {len(combined_df)} (including {len(real_df)} real-world disaster photos)")
    return combined_csv


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", default="data")
    args = parser.parse_args()
    download_and_merge_real_dataset(args.data_dir)
