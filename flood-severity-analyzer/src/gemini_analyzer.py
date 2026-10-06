"""
Gemini Multimodal Vision Evaluator for Flood Severity Assessment.
Prioritizes Gemini 3.8 Flash, with automatic resilient fallback to Gemini 3.6 Flash
and local PyTorch model.
"""

import os
import re
import json
import base64
import logging
import time
from typing import Optional, Dict, Any
from pathlib import Path
import requests
from dotenv import load_dotenv

# Load environment variables
current_dir = Path(__file__).resolve().parent
load_dotenv(current_dir.parent / ".env")
load_dotenv(current_dir.parent.parent / ".env")

logger = logging.getLogger("gemini_analyzer")
logging.basicConfig(level=logging.INFO)

# Prioritize Gemini 3.8 Flash, then 3.6 Flash
GEMINI_MODELS = [
    "gemini-3.8-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
]

API_TEMPLATE = "https://generativelanguage.googleapis.com/v1/models/{model}:generateContent?key={key}"

SYSTEM_PROMPT = """You are an expert disaster response and emergency search-and-rescue computer vision AI.
Analyze the provided image and assess flood severity with extreme precision.

CRITICAL ASSESSMENT GUIDELINES:
1. NON-FLOOD / DRY ENVIRONMENT:
   - If the image depicts a normal dry scene (e.g. university campus, dry building facade like Thapar University, dry streets, indoor rooms, clean pavement, sunny day without water accumulation):
     - severity_score: 1
     - severity_level: "LOW"
     - rescue_priority: "LOW"
     - estimated_depth: "0 cm (Dry Surface)"
     - road_access: "CLEAR"
     - title: "Normal Condition: No Flood Inundation Detected"

2. CASUALTY / LIFE-THREATENING PERIL:
   - If the image shows human casualties, submerged bodies, drowning victims, individuals stranded on rooftops amidst raging floodwaters, or severe structural collapse:
     - severity_score: 10
     - severity_level: "EXTREME"
     - rescue_priority: "CRITICAL"
     - estimated_depth: "> 1.5m (Torrential Flood / Life Hazard)"
     - road_access: "COMPLETELY_BLOCKED"
     - title: "CRITICAL EMERGENCY: Catastrophic Flood with Casualty / Life Hazard"

3. MINOR FLOOD / PUDDLES:
   - Ankle-deep surface water or curb puddles (< 20 cm) -> severity_score: 2-3, severity_level: "LOW", rescue_priority: "LOW", road_access: "CLEAR" or "PASSABLE_CAUTION".

4. MODERATE INUNDATION:
   - Knee-deep water covering street curbs, vehicle tires partially submerged (30-60 cm) -> severity_score: 4-6, severity_level: "MODERATE", rescue_priority: "MEDIUM", road_access: "PASSABLE_CAUTION" or "IMPASSABLE".

5. SEVERE FLOOD:
   - Waist-to-chest deep water, vehicles submerged up to hoods or floating, ground floor entryways flooded (80-150 cm) -> severity_score: 7-8, severity_level: "HIGH", rescue_priority: "HIGH", road_access: "IMPASSABLE".

6. CATASTROPHIC INUNDATION:
   - First-story level or rooftop water, swift torrential currents, widespread structural submergence (> 1.5 m) -> severity_score: 9-10, severity_level: "EXTREME", rescue_priority: "CRITICAL", road_access: "COMPLETELY_BLOCKED".

Return ONLY a strict JSON object with EXACTLY these keys:
{
  "severity_score": <int 1-10>,
  "severity_level": <"LOW" | "MODERATE" | "HIGH" | "EXTREME">,
  "rescue_priority": <"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">,
  "confidence": <float 0.85 - 0.99>,
  "title": "<Concise incident headline>",
  "description": "<Detailed situational assessment>",
  "what_is_in_image": "<Specific physical elements, water coverage, and objects observed in image>",
  "estimated_depth": "<e.g. '0 cm (Dry Surface)', '0.3m - 0.5m (Knee Deep)', etc.>",
  "road_access": "<'CLEAR' | 'PASSABLE_CAUTION' | 'IMPASSABLE' | 'COMPLETELY_BLOCKED'>",
  "recommendations": ["<action 1>", "<action 2>", "<action 3>", "<action 4>"]
}
"""


def get_gemini_api_key() -> Optional[str]:
    return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")


def extract_json_object(raw_text: str) -> Optional[Dict[str, Any]]:
    """Robustly extracts JSON object from Gemini response text."""
    text = raw_text.strip()
    try:
        return json.loads(text)
    except Exception:
        pass

    if "```" in text:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            try:
                return json.loads(match.group(1).strip())
            except Exception:
                pass

    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        try:
            return json.loads(text[first_brace : last_brace + 1])
        except Exception:
            pass

    return None


def analyze_with_gemini(image_base64: str) -> Optional[Dict[str, Any]]:
    """
    Sends base64 image to Gemini multimodal API (Gemini 3.8 with resilient fallback to 3.6).
    Returns parsed dictionary matching FloodScoreResponseDTO, or None if unavailable/failed.
    """
    api_key = get_gemini_api_key()
    if not api_key:
        logger.info("[Gemini Vision] No GEMINI_API_KEY found, using local ML model fallback")
        return None

    clean_b64 = image_base64
    mime_type = "image/jpeg"
    if "," in clean_b64:
        header, clean_b64 = clean_b64.split(",", 1)
        if "png" in header.lower():
            mime_type = "image/png"
        elif "webp" in header.lower():
            mime_type = "image/webp"

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": clean_b64,
                        }
                    },
                    {
                        "text": SYSTEM_PROMPT
                    }
                ]
            }
        ]
    }

    for model_name in GEMINI_MODELS:
        url = API_TEMPLATE.format(model=model_name, key=api_key)
        try:
            resp = requests.post(url, json=payload, timeout=20)
            if resp.status_code == 200:
                data = resp.json()
                parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])
                candidate_text = parts[0].get("text", "")
                if candidate_text:
                    parsed = extract_json_object(candidate_text)
                    if parsed:
                        score = int(max(1, min(10, round(parsed.get("severity_score", 1)))))
                        parsed["severity_score"] = score
                        parsed["confidence"] = float(parsed.get("confidence", 0.95))
                        if not isinstance(parsed.get("recommendations"), list):
                            parsed["recommendations"] = [str(parsed.get("recommendations", "Follow safety protocols."))]

                        logger.info(
                            f"[Gemini Vision ({model_name})] Assessed image successfully: "
                            f"score={score}, level={parsed.get('severity_level')}, title={parsed.get('title')}"
                        )
                        return parsed
            elif resp.status_code in [503, 429]:
                logger.warning(f"[{model_name}] Received {resp.status_code} (capacity spike). Trying next candidate...")
                continue
            else:
                logger.warning(f"[{model_name}] Failed with status {resp.status_code}: {resp.text[:150]}")
        except Exception as e:
            logger.warning(f"[{model_name}] Error during call: {str(e)}")

    logger.warning("[Gemini Vision] Falling back to local PyTorch FloodSeverityNet model")
    return None
