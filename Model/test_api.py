import requests
import os

API_SCORE_URL = "http://127.0.0.1:8000/api/v1/score"
TEST_IMAGE_PATH = os.path.join("sample_images", "severe_flood.jpg")

def test_score_api():
    if not os.path.exists(TEST_IMAGE_PATH):
        print("Run sample_generator.py first to create test images.")
        return

    print(f"Posting image '{TEST_IMAGE_PATH}' to {API_SCORE_URL}...")
    with open(TEST_IMAGE_PATH, "rb") as img_file:
        files = {"file": ("severe_flood.jpg", img_file, "image/jpeg")}
        res = requests.post(API_SCORE_URL, files=files)
        if res.status_code == 200:
            data = res.json()
            print(f"API Output JSON: {data}")
            print(f"Severity Score Integer: {data['severity_score']}")
        else:
            print(f"Error {res.status_code}: {res.text}")

if __name__ == "__main__":
    test_score_api()
