"""
Utility to download real-world flood datasets (e.g. from Hugging Face or public URLs)
and format them into the standard annotations.csv format with severity scores out of 10.
"""

import argparse
import os
import pandas as pd
import requests
from tqdm import tqdm


SAMPLE_PUBLIC_FLOOD_URLS = [
    {
        "url": "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&q=80",
        "filename": "real_minor_puddle.jpg",
        "severity_score": 1.2,
        "water_depth": 1.0,
        "vehicle_risk": 0.5,
        "structural_risk": 0.0,
    },
    {
        "url": "https://images.unsplash.com/photo-1514632595-4944383f2737?w=800&q=80",
        "filename": "real_moderate_street_water.jpg",
        "severity_score": 4.5,
        "water_depth": 4.2,
        "vehicle_risk": 3.8,
        "structural_risk": 1.5,
    },
    {
        "url": "https://images.unsplash.com/photo-1574063413132-355dbfd83e25?w=800&q=80",
        "filename": "real_severe_submerged_car.jpg",
        "severity_score": 7.4,
        "water_depth": 7.0,
        "vehicle_risk": 8.5,
        "structural_risk": 4.2,
    },
]


def download_sample_real_images(output_dir: str = "data"):
    images_dir = os.path.join(output_dir, "images")
    os.makedirs(images_dir, exist_ok=True)
    csv_path = os.path.join(output_dir, "annotations.csv")

    existing_df = pd.read_csv(csv_path) if os.path.exists(csv_path) else pd.DataFrame()

    new_rows = []
    print("[*] Downloading sample real-world benchmark images...")
    for item in SAMPLE_PUBLIC_FLOOD_URLS:
        dest_path = os.path.join(images_dir, item["filename"])
        try:
            resp = requests.get(item["url"], timeout=10)
            if resp.status_code == 200:
                with open(dest_path, "wb") as f:
                    f.write(resp.content)
                new_rows.append({
                    "image_path": os.path.join("images", item["filename"]),
                    "severity_score": item["severity_score"],
                    "water_depth": item["water_depth"],
                    "vehicle_risk": item["vehicle_risk"],
                    "structural_risk": item["structural_risk"],
                })
                print(f"  [+] Downloaded: {item['filename']} (Severity: {item['severity_score']}/10)")
        except Exception as e:
            print(f"  [-] Could not download {item['filename']}: {e}")

    if new_rows:
        new_df = pd.DataFrame(new_rows)
        combined_df = pd.concat([existing_df, new_df], ignore_index=True).drop_duplicates(subset=["image_path"])
        combined_df.to_csv(csv_path, index=False)
        print(f"[✓] Updated annotations at {csv_path} with downloaded samples.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=str, default="data")
    args = parser.parse_args()
    download_sample_real_images(args.output_dir)
