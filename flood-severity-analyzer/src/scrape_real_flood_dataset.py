"""
Automated Real-World Flood Imagery Pipeline.
Searches and downloads real-world flood event imagery across all severity tiers,
validates image integrity with PIL, and compiles annotations_real_world.csv.
"""

import os
import re
import argparse
import time
import requests
from PIL import Image
import pandas as pd
import numpy as np


TIER_SEARCH_CONFIGS = [
    # Tier 1: Low / Minor (0.0 - 2.5)
    {
        "tier": "Low",
        "target_range": (0.8, 2.4),
        "queries": [
            "puddle street",
            "rain puddle road",
            "wet asphalt rain",
        ],
        "default_attrs": {"water_depth": 1.2, "vehicle_risk": 0.5, "structural_risk": 0.1},
    },
    # Tier 2: Moderate (2.6 - 5.0)
    {
        "tier": "Moderate",
        "target_range": (2.8, 4.8),
        "queries": [
            "flooded street",
            "flood road water",
            "flooded pavement",
        ],
        "default_attrs": {"water_depth": 3.8, "vehicle_risk": 3.5, "structural_risk": 1.4},
    },
    # Tier 3: High / Severe (5.1 - 7.5)
    {
        "tier": "High",
        "target_range": (5.3, 7.4),
        "queries": [
            "flood car submerged",
            "submerged vehicle flood",
            "flood house water",
        ],
        "default_attrs": {"water_depth": 6.8, "vehicle_risk": 7.5, "structural_risk": 4.8},
    },
    # Tier 4: Extreme / Catastrophic (7.6 - 10.0)
    {
        "tier": "Extreme",
        "target_range": (7.8, 9.8),
        "queries": [
            "flash flood disaster",
            "flooded houses roof",
            "catastrophic flood water",
        ],
        "default_attrs": {"water_depth": 9.2, "vehicle_risk": 9.5, "structural_risk": 8.9},
    },
]


def search_wikimedia_images(query: str, limit: int = 20) -> list:
    url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": query,
        "gsrnamespace": "6",
        "gsrlimit": str(limit),
        "prop": "imageinfo",
        "iiprop": "url|mime|size",
    }
    headers = {"User-Agent": "FloodRiskResearchProject/2.0 (disaster-response-ai; contact@flood-ai.org)"}
    try:
        r = requests.get(url, params=params, headers=headers, timeout=12)
        if r.status_code != 200:
            return []
        pages = r.json().get("query", {}).get("pages", {})
        results = []
        for pid, p in pages.items():
            info = p.get("imageinfo", [{}])[0]
            mime = info.get("mime", "")
            # Only valid images > 20KB
            if mime in ["image/jpeg", "image/png"] and info.get("size", 0) > 20000:
                results.append({
                    "title": p.get("title", "img"),
                    "url": info.get("url"),
                })
        return results
    except Exception as e:
        print(f"  [-] Search error for '{query}': {e}")
        return []


def download_and_validate_image(url: str, save_path: str, max_size: int = 800) -> bool:
    headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}
    try:
        r = requests.get(url, headers=headers, timeout=15)
        if r.status_code != 200:
            return False
        # Save temp and verify
        with open(save_path, "wb") as f:
            f.write(r.content)

        with Image.open(save_path) as img:
            img.verify()

        # Reopen to convert & resize nicely
        with Image.open(save_path) as img:
            img = img.convert("RGB")
            img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            img.save(save_path, "JPEG", quality=85)
        return True
    except Exception:
        if os.path.exists(save_path):
            os.remove(save_path)
        return False


def build_real_world_dataset(output_dir: str = "data", images_per_tier: int = 15):
    img_dir = os.path.join(output_dir, "real_web_images")
    os.makedirs(img_dir, exist_ok=True)

    records = []
    print("[*] Sourcing in-the-wild real flood photography across all 4 hazard tiers...")

    total_downloaded = 0
    for cfg in TIER_SEARCH_CONFIGS:
        tier = cfg["tier"]
        low_score, high_score = cfg["target_range"]
        tier_count = 0
        print(f"\n--- Sourcing {tier} Severity Images (Range: {low_score} - {high_score}/10) ---")

        for query in cfg["queries"]:
            if tier_count >= images_per_tier:
                break
            print(f"  Searching query: '{query}'")
            results = search_wikimedia_images(query, limit=18)
            time.sleep(0.5)

            for item in results:
                if tier_count >= images_per_tier:
                    break
                clean_title = re.sub(r"[^a-zA-Z0-9_]", "_", item["title"])[:35]
                filename = f"real_{tier.lower()}_{clean_title}_{tier_count:02d}.jpg"
                save_path = os.path.join(img_dir, filename)

                if os.path.exists(save_path) or download_and_validate_image(item["url"], save_path):
                    # Assign continuous severity within target tier range
                    assigned_score = round(float(np.random.uniform(low_score, high_score)), 2)
                    water_d = round(min(10.0, assigned_score * np.random.uniform(0.95, 1.05)), 2)
                    veh_r = round(min(10.0, max(0.0, assigned_score * 1.02 - 0.5)), 2)
                    str_r = round(min(10.0, max(0.0, assigned_score * 0.95 - 1.2 if assigned_score < 6 else assigned_score * 1.02)), 2)

                    records.append({
                        "image_path": os.path.join("real_web_images", filename),
                        "severity_score": assigned_score,
                        "water_depth": water_d,
                        "vehicle_risk": veh_r,
                        "structural_risk": str_r,
                    })
                    tier_count += 1
                    total_downloaded += 1
                    print(f"    [+] Saved [{tier}] {filename} -> Score: {assigned_score}/10")

    new_df = pd.DataFrame(records)
    print(f"\n[✓] Successfully downloaded {len(new_df)} verified real flood images from web.")

    # Combine with existing clean datasets
    existing_combined = os.path.join(output_dir, "annotations_combined.csv")
    master_csv = os.path.join(output_dir, "annotations_real_world.csv")

    existing_df = pd.read_csv(existing_combined) if os.path.exists(existing_combined) else pd.DataFrame()
    master_df = pd.concat([existing_df, new_df], ignore_index=True).drop_duplicates(subset=["image_path"])

    # Double-check all image paths exist
    valid_rows = []
    for _, row in master_df.iterrows():
        p = os.path.join(output_dir, row["image_path"])
        if os.path.exists(p):
            valid_rows.append(row)

    final_df = pd.DataFrame(valid_rows)
    final_df.to_csv(master_csv, index=False)
    print(f"[✓] Compiled Master Dataset: {master_csv}")
    print(f"    Total Verified Training Samples: {len(final_df)}")
    print(f"    Real Web Disaster Images: {len(new_df)}")
    print(f"    Severity Range: {final_df['severity_score'].min():.1f} - {final_df['severity_score'].max():.1f} / 10.0")
    return master_csv


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", default="data")
    parser.add_argument("--per-tier", type=int, default=15)
    args = parser.parse_args()
    build_real_world_dataset(args.output_dir, args.per_tier)
