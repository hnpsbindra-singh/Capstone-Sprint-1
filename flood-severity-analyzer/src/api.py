"""
FastAPI REST Service for Spring Boot VictimService Integration.
Powered by Groq Vision (qwen/qwen3.8-27b) with Gemini Vision fallback.

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
from PIL import Image
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from gemini_analyzer import analyze_flood_image, generate_severity_1_fallback

# ---------------------------------------------------------------------------
# App initialization & CORS
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Flood Severity Assessment API",
    description="Multimodal Vision API for Spring Boot victimservice flood reporting",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
# Helper: Validate Base64 Image
# ---------------------------------------------------------------------------
def validate_base64_image(b64_str: str) -> None:
    if not b64_str or not b64_str.strip():
        raise ValueError("Empty image_base64 provided.")
    clean = b64_str
    if "," in clean:
        clean = clean.split(",", 1)[1]
    try:
        raw_bytes = base64.b64decode(clean)
        if len(raw_bytes) < 10:
            raise ValueError("Base64 payload too small to be a valid image.")
    except Exception as e:
        raise ValueError(f"Failed to decode base64 image: {str(e)}")


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
def root():
    return {
        "status": "UP",
        "service": "FloodSeverityAssessmentService",
        "engine": "Groq -> Gemini Vision Cascade",
        "endpoints": {
            "health": "/health",
            "score": "/api/v1/score-base64"
        }
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify service readiness."""
    return {
        "status": "UP",
        "service": "FloodSeverityAssessmentService",
        "engine": "Groq -> Gemini Vision Cascade",
        "model_ready": True,
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
@app.post("/api/v1/score", response_model=FloodScoreResponseDTO, status_code=status.HTTP_200_OK)
@app.post("/api", response_model=FloodScoreResponseDTO, status_code=status.HTTP_200_OK)
@app.post("/score", response_model=FloodScoreResponseDTO, status_code=status.HTTP_200_OK)
@app.post("/score-base64", response_model=FloodScoreResponseDTO, status_code=status.HTTP_200_OK)
@app.post("/", response_model=FloodScoreResponseDTO, status_code=status.HTTP_200_OK)
def score_flood_image(request: FloodScoreRequestDTO):
    """
    Main endpoint consumed by Spring Boot VictimService.
    Accepts FloodScoreRequestDTO with image_base64 and returns complete FloodScoreResponseDTO.
    Runs Groq Vision first, falling back to Gemini Vision, and finally to a safe baseline.
    """
    try:
        validate_base64_image(request.image_base64)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image payload: {str(ve)}",
        )

    result = analyze_flood_image(request.image_base64)
    return FloodScoreResponseDTO(**result)


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("api:app", host="0.0.0.0", port=port, reload=False)
