"""
FastAPI REST Service for Spring Boot VictimService Integration.

Matches Java DTO contracts:
  - Request:  FloodScoreRequestDTO (image_base64)
  - Response: FloodScoreResponseDTO (severity_score, severity_level, rescue_priority,
                                    confidence, title, description, what_is_in_image,
                                    estimated_depth, road_access, recommendations)
"""

import base64
import io
import os
import sys
from typing import List, Optional
import numpy as np
from PIL import Image
from pydantic import BaseModel, Field
import torch
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dataset import get_transforms
from model import FloodSeverityNet
from calibrate import apply_calibration
from gemini_analyzer import analyze_with_gemini

# ---------------------------------------------------------------------------
# App initialization & CORS
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Flood Severity Assessment API",
    description="Deep Learning API for Spring Boot victimservice flood reporting",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Paths and Model Cache
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHECKPOINT_V2 = os.path.join(BASE_DIR, "checkpoints_v2", "best_model.pth")
CHECKPOINT_V1 = os.path.join(BASE_DIR, "checkpoints", "best_model.pth")
CALIBRATOR_PATH = os.path.join(BASE_DIR, "checkpoints_v2", "calibration.pkl")

MODEL = None
DEVICE = None


def get_model():
    global MODEL, DEVICE
    if MODEL is None:
        DEVICE = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
        ckpt_path = CHECKPOINT_V2 if os.path.exists(CHECKPOINT_V2) else CHECKPOINT_V1
        if not os.path.exists(ckpt_path):
            raise RuntimeError(f"Model checkpoint not found at {ckpt_path}. Train the model first.")
        
        ckpt = torch.load(ckpt_path, map_location=DEVICE)
        backbone = ckpt.get("backbone", "efficientnet_b2")
        use_fpn = ckpt.get("use_fpn", True)
        use_seg = ckpt.get("use_seg_head", True)

        MODEL = FloodSeverityNet(
            backbone_name=backbone,
            pretrained=False,
            use_fpn=use_fpn,
            use_seg_head=use_seg,
        )
        MODEL.load_state_dict(ckpt["model_state_dict"])
        MODEL.to(DEVICE).eval()
        MODEL.register_cam_hooks()
        print(f"[*] API Model loaded successfully on {DEVICE} using backbone {backbone}")
    return MODEL, DEVICE


# ---------------------------------------------------------------------------
# Pydantic DTOs matching Spring Boot
# ---------------------------------------------------------------------------
class FloodScoreRequestDTO(BaseModel):
    image_base64: str = Field(
        ...,
        description="Base64-encoded image string (with or without 'data:image/...;base64,' prefix)",
    )


class FloodScoreResponseDTO(BaseModel):
    severity_score: int = Field(
        ...,
        description="Integer severity score out of 10 (1-10)",
    )
    severity_level: str = Field(
        ...,
        description="Severity classification tier: LOW, MODERATE, HIGH, EXTREME",
    )
    rescue_priority: str = Field(
        ...,
        description="Emergency triage priority: LOW, MEDIUM, HIGH, CRITICAL",
    )
    confidence: float = Field(
        ...,
        description="Model confidence score between 0.0 and 1.0",
    )
    title: str = Field(
        ...,
        description="Concise human-readable incident headline",
    )
    description: str = Field(
        ...,
        description="Detailed natural-language disaster assessment",
    )
    what_is_in_image: str = Field(
        ...,
        description="Visual elements and features identified by the model",
    )
    estimated_depth: str = Field(
        ...,
        description="Estimated water depth range with physical landmarks",
    )
    road_access: str = Field(
        ...,
        description="Accessibility status: CLEAR, PASSABLE_CAUTION, IMPASSABLE, COMPLETELY_BLOCKED",
    )
    recommendations: List[str] = Field(
        ...,
        description="Actionable disaster response and safety recommendations",
    )

    class Config:
        populate_by_name = True


# ---------------------------------------------------------------------------
# Helper: Decode Base64 Image
# ---------------------------------------------------------------------------
def decode_base64_image(b64_str: str) -> Image.Image:
    if not b64_str:
        raise ValueError("Empty image_base64 provided.")

    # Remove data URL header if present (e.g. data:image/jpeg;base64,)
    if "," in b64_str:
        b64_str = b64_str.split(",", 1)[1]

    try:
        raw_bytes = base64.b64decode(b64_str)
        img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
        return img
    except Exception as e:
        raise ValueError(f"Failed to decode base64 image: {str(e)}")


# ---------------------------------------------------------------------------
# Assessment Generator Logic
# ---------------------------------------------------------------------------
def generate_flood_assessment(
    score_raw: float,
    score_int: int,
    attrs: np.ndarray,
    uncertainty_std: float,
) -> dict:
    water_d = float(attrs[0])
    veh_r = float(attrs[1])
    struct_r = float(attrs[2])

    # Confidence calculation: lower uncertainty -> higher confidence (bounded [0.65, 0.98])
    confidence = round(float(np.clip(1.0 - (uncertainty_std * 0.12), 0.65, 0.98)), 2)

    # Classification & Triage
    if score_int <= 2:
        severity_level = "LOW"
        rescue_priority = "LOW"
        title = "Minor Water Ponding / Surface Runoff"
        estimated_depth = "0.05m - 0.2m (Shallow puddles / ankle depth)"
        road_access = "CLEAR"
        desc = (
            f"The image exhibits light rainfall accumulation and minor pavement puddles. "
            f"Water depth is minimal ({water_d:.1f}/10) with no vehicle or structural damage detected. "
            f"Normal municipal operations and vehicular transit can proceed."
        )
        what_in_img = "Wet asphalt roadways, small surface puddles, intact sidewalks, clear drainage flow."
        recs = [
            "Normal travel permitted with standard wet-weather driving caution.",
            "Inspect street storm drains for early leaf and litter blockage.",
            "Continue standard meteorological monitoring.",
        ]

    elif score_int <= 5:
        severity_level = "MODERATE"
        rescue_priority = "MEDIUM"
        title = "Moderate Street Inundation / Drainage Surcharge"
        estimated_depth = "0.25m - 0.5m (Shin to below-knee depth)"
        road_access = "PASSABLE_CAUTION"
        desc = (
            f"Moderate street-level flooding detected with water covering the curb line ({water_d:.1f}/10). "
            f"Vehicles face traction hazards and small sedans risk stalling (vehicle risk: {veh_r:.1f}/10). "
            f"Low-lying basements and ground-level doorsteps are threatened."
        )
        what_in_img = "Water covering roadway curb-to-curb, splashing tire spray, submerged gutters, drainage overflow."
        recs = [
            "Reroute low-clearance passenger cars away from low-lying intersections.",
            "Erect high-water warning markers on affected roadways.",
            "Deploy municipal suction pumps to clearing overwhelmed storm basins.",
            "Residents in ground-floor units should prepare sandbags at door thresholds.",
        ]

    elif score_int <= 7:
        severity_level = "HIGH"
        rescue_priority = "HIGH"
        title = "Severe Flood Inundation / Submerged Vehicles"
        estimated_depth = "0.6m - 1.2m (Knee to waist deep / vehicle hood level)"
        road_access = "IMPASSABLE"
        desc = (
            f"Significant flood emergency observed with deep standing water ({water_d:.1f}/10). "
            f"Vehicles are partially or fully submerged up to wheel arches or hoods (vehicle risk: {veh_r:.1f}/10). "
            f"Ground floors and electrical conduits are compromised (structural risk: {struct_r:.1f}/10)."
        )
        what_in_img = (
            "Submerged automobiles, waist-deep turbid water, flooded doorsteps, floating urban debris."
        )
        recs = [
            "DO NOT attempt to drive or walk through floodwaters (Turn Around Don't Drown).",
            "Shut off main electrical breakers and gas supplies in ground-floor structures.",
            "Dispatch emergency rescue squads and high-clearance utility vehicles.",
            "Evacuate ground-floor occupants to second-story shelters or higher ground.",
        ]

    else:
        severity_level = "EXTREME"
        rescue_priority = "CRITICAL"
        title = "Catastrophic Flood Disaster / Life-Safety Hazard"
        estimated_depth = "> 1.5m (Chest to roof level / rapid current)"
        road_access = "COMPLETELY_BLOCKED"
        desc = (
            f"Critical disaster condition detected with deep raging floodwaters ({water_d:.1f}/10). "
            f"Submerged structures, roof-level water, or high-velocity currents pose immediate life-threatening hazard. "
            f"Severe structural collapse and vehicle displacement risk ({struct_r:.1f}/10)."
        )
        what_in_img = (
            "Rooftop-level inundation, swift torrential currents, partially collapsed walls, floating cars, severe structural destruction."
        )
        recs = [
            "IMMEDIATE EMERGENCY RESPONSE REQUIRED: Dispatch swiftwater rescue boats and helicopter evacuation.",
            "Survivors should move to highest sturdy elevation (rooftops/upper floors) and signal for rescue.",
            "Avoid attics unless an unobstructed roof-access hatch is available.",
            "Establish incident command post and emergency medical staging areas outside flood zone.",
        ]

    return {
        "severity_level": severity_level,
        "rescue_priority": rescue_priority,
        "title": title,
        "description": desc,
        "what_is_in_image": what_in_img,
        "estimated_depth": estimated_depth,
        "road_access": road_access,
        "recommendations": recs,
        "confidence": confidence,
    }


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify model readiness."""
    try:
        _, device = get_model()
        return {
            "status": "UP",
            "service": "FloodSeverityAssessmentService",
            "device": str(device),
            "model_ready": True,
        }
    except Exception as e:
        return {
            "status": "DEGRADED",
            "service": "FloodSeverityAssessmentService",
            "error": str(e),
            "model_ready": False,
        }


@app.post(
    "/api/v1/flood/score",
    response_model=FloodScoreResponseDTO,
    status_code=status.HTTP_200_OK,
    tags=["Flood Assessment"],
    summary="Analyze Flood Image and Return FloodScoreResponseDTO",
)
@app.post(
    "/api/v1/score-base64",
    response_model=FloodScoreResponseDTO,
    status_code=status.HTTP_200_OK,
    tags=["Flood Assessment"],
    summary="Analyze Flood Image (Spring Boot legacy alias)",
)
def score_flood_image(request: FloodScoreRequestDTO):
    """
    Main endpoint consumed by Spring Boot VictimService.
    Accepts FloodScoreRequestDTO with image_base64 and returns complete FloodScoreResponseDTO.
    """
    try:
        # 1. Decode image
        image_pil = decode_base64_image(request.image_base64)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image payload: {str(ve)}",
        )

    # 2. Try Gemini 3.8 Vision first
    try:
        gemini_result = analyze_with_gemini(request.image_base64)
        if gemini_result is not None:
            return FloodScoreResponseDTO(**gemini_result)
    except Exception as ge:
        print(f"[Gemini 3.8 Vision] Fallback due to exception: {ge}")

    # 3. Fallback to local PyTorch FloodSeverityNet Deep Learning model
    try:
        model, device = get_model()

        # Preprocess
        transform = get_transforms("val", img_size=224)
        tensor = transform(image_pil).unsqueeze(0).to(device)

        # 3. Model inference
        with torch.no_grad():
            pred_sev, pred_lv, pred_attrs, _ = model(tensor)
            raw_score = float(pred_sev.item())
            logvar = float(pred_lv.item())
            attrs_np = pred_attrs.cpu().numpy()[0]

        uncertainty_std = float(np.exp(0.5 * logvar))

        # 4. Calibrate score
        calibrated_score = apply_calibration(raw_score, CALIBRATOR_PATH)

        # 5. Round to integer severity score out of 10 (clamped between 1 and 10)
        severity_score_int = int(np.clip(round(calibrated_score), 1, 10))

        # 6. Generate comprehensive assessment matching Spring Boot DTO
        assessment = generate_flood_assessment(
            score_raw=calibrated_score,
            score_int=severity_score_int,
            attrs=attrs_np,
            uncertainty_std=uncertainty_std,
        )

        response = FloodScoreResponseDTO(
            severity_score=severity_score_int,
            severity_level=assessment["severity_level"],
            rescue_priority=assessment["rescue_priority"],
            confidence=assessment["confidence"],
            title=assessment["title"],
            description=assessment["description"],
            what_is_in_image=assessment["what_is_in_image"],
            estimated_depth=assessment["estimated_depth"],
            road_access=assessment["road_access"],
            recommendations=assessment["recommendations"],
        )
        return response

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference failure: {str(e)}",
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=False)
