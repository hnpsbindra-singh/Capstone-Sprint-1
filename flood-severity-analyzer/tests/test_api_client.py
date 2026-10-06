"""
Unit test & client simulator verifying FastAPI endpoint integration with Spring Boot DTOs.
"""

import base64
import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src"))
from api import app

client = TestClient(app)


def test_health_endpoint():
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    print("[✓] Health Check Response:", data)
    assert data["status"] == "UP"
    assert data["model_ready"] is True


def test_flood_score_endpoint():
    # Test with a real flood image
    sample_img_path = "data/real_images/real_ext_house_flooded.jpg"
    if not os.path.exists(sample_img_path):
        sample_img_path = "data/real_images/real_low_rain_road.jpg"

    with open(sample_img_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("utf-8")

    # Send FloodScoreRequestDTO
    payload = {
        "image_base64": f"data:image/jpeg;base64,{img_b64}"
    }

    print(f"\n[*] Sending FloodScoreRequestDTO for image: {sample_img_path}...")
    resp = client.post("/api/v1/flood/score", json=payload)
    print(f"[*] Response Status Code: {resp.status_code}")
    assert resp.status_code == 200

    data = resp.json()
    print("\n" + "=" * 65)
    print("  EXACT JSON RECEIVED BY SPRING BOOT FloodScoreResponseDTO")
    print("=" * 65)
    import json
    print(json.dumps(data, indent=2))
    print("=" * 65)

    # Validate all fields in Spring Boot FloodScoreResponseDTO
    assert isinstance(data["severity_score"], int)
    assert 1 <= data["severity_score"] <= 10
    assert data["severity_level"] in ["LOW", "MODERATE", "HIGH", "EXTREME"]
    assert data["rescue_priority"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert isinstance(data["confidence"], (int, float))
    assert isinstance(data["title"], str) and len(data["title"]) > 0
    assert isinstance(data["description"], str) and len(data["description"]) > 0
    assert isinstance(data["what_is_in_image"], str) and len(data["what_is_in_image"]) > 0
    assert isinstance(data["estimated_depth"], str) and len(data["estimated_depth"]) > 0
    assert data["road_access"] in ["CLEAR", "PASSABLE_CAUTION", "IMPASSABLE", "COMPLETELY_BLOCKED"]
    assert isinstance(data["recommendations"], list) and len(data["recommendations"]) > 0

    print("\n[✓] All Spring Boot DTO fields strictly validated!")


if __name__ == "__main__":
    test_health_endpoint()
    test_flood_score_endpoint()
