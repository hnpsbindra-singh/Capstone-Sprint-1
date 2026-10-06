"""
Vercel Serverless Entrypoint for ResQFlow AI Flood Severity Assessment.
Routes traffic to Gemini 3.8 Flash Vision Analyzer.
Compliant with Vercel Python runtime (@vercel/python) and Spring Boot VictimService.
"""

import os
import sys
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware

# Ensure 'src' is in python search path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
src_dir = os.path.join(parent_dir, "src")
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)

from gemini_analyzer import analyze_with_gemini

# ---------------------------------------------------------------------------
# App Initialization & CORS
# ---------------------------------------------------------------------------
app = FastAPI(
    title="ResQFlow AI Vision Serverless API",
    description="Multimodal Gemini 3.8 Flash Vision flood analysis deployed serverless on Vercel",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def normalize_vercel_paths(request: Request, call_next):
    """Normalize Vercel rewrite paths so routing works with or without prefixes."""
    path = request.scope.get("path", "")
    for prefix in ["/api/index.py", "/api/index"]:
        if path.startswith(prefix):
            new_path = path[len(prefix):] or "/"
            request.scope["path"] = new_path
            break
    response = await call_next(request)
    return response


# ---------------------------------------------------------------------------
# DTO Definitions (matching Spring Boot VictimService contract)
# ---------------------------------------------------------------------------
class FloodScoreRequestDTO(BaseModel):
    image_base64: str = Field(
        ...,
        description="Base64-encoded image string (with or without 'data:image/...;base64,' prefix)",
    )


class FloodScoreResponseDTO(BaseModel):
    severity_score: int = Field(..., description="Integer severity score out of 10 (1-10)")
    severity_level: str = Field(..., description="LOW, MODERATE, HIGH, EXTREME")
    rescue_priority: str = Field(..., description="LOW, MEDIUM, HIGH, CRITICAL")
    confidence: float = Field(..., description="Confidence between 0.0 and 1.0")
    title: str = Field(..., description="Incident headline")
    description: str = Field(..., description="Assessment details")
    what_is_in_image: str = Field(..., description="Identified visual elements")
    estimated_depth: str = Field(..., description="Depth range e.g. '0 cm (Dry Surface)'")
    road_access: str = Field(..., description="CLEAR, PASSABLE_CAUTION, IMPASSABLE, COMPLETELY_BLOCKED")
    recommendations: List[str] = Field(..., description="Safety and triage recommendations")

    class Config:
        populate_by_name = True


# ---------------------------------------------------------------------------
# Health Check Endpoints
# ---------------------------------------------------------------------------
@app.get("/")
@app.get("/health")
@app.get("/api")
@app.get("/api/health")
def health():
    return {
        "status": "UP",
        "service": "ResQFlow-AI-Vision",
        "engine": "Gemini 3.8 Flash Vision",
        "deployment": "Vercel Serverless"
    }


# ---------------------------------------------------------------------------
# Score Image Endpoints (Multiple aliases to prevent any routing mismatch)
# ---------------------------------------------------------------------------
@app.post("/api/v1/flood/score", response_model=FloodScoreResponseDTO)
@app.post("/api/v1/score-base64", response_model=FloodScoreResponseDTO)
@app.post("/flood/score", response_model=FloodScoreResponseDTO)
@app.post("/score-base64", response_model=FloodScoreResponseDTO)
@app.post("/score", response_model=FloodScoreResponseDTO)
def score_flood_image(request: FloodScoreRequestDTO):
    if not request.image_base64 or not request.image_base64.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing 'image_base64' payload in request.",
        )

    result = analyze_with_gemini(request.image_base64)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to evaluate image with Gemini Vision AI. Verify GEMINI_API_KEY.",
        )

    return FloodScoreResponseDTO(**result)


# Catch-all GET fallback
@app.get("/{catchall:path}")
def catch_all_get(catchall: str, request: Request):
    return {
        "status": "UP",
        "service": "ResQFlow-AI-Vision",
        "engine": "Gemini 3.8 Flash Vision",
        "deployment": "Vercel Serverless",
        "requested_path": f"/{catchall}",
        "url": str(request.url)
    }
