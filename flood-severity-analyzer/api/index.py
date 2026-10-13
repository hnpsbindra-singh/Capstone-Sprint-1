"""
Vercel Serverless Entrypoint for ResQFlow AI Flood Severity Assessment.
Routes traffic through cascading Groq Vision -> Gemini Vision Analyzer.
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

from gemini_analyzer import analyze_flood_image, generate_severity_1_fallback

# ---------------------------------------------------------------------------
# App Initialization & CORS
# ---------------------------------------------------------------------------
app = FastAPI(
    title="ResQFlow AI Vision Serverless API",
    description="Multimodal Groq -> Gemini Vision flood analysis deployed serverless on Vercel",
    version="2.0.0",
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
# Health Check Endpoints (GET & HEAD)
# ---------------------------------------------------------------------------
@app.get("/")
@app.get("/health")
@app.get("/api")
@app.get("/api/health")
@app.head("/")
@app.head("/health")
@app.head("/api")
@app.head("/api/health")
def health():
    return {
        "status": "UP",
        "service": "ResQFlow-AI-Vision",
        "engine": "Groq -> Gemini Vision Cascade",
        "deployment": "Vercel Serverless"
    }


# ---------------------------------------------------------------------------
# Score Image Endpoints (POST across all possible paths to prevent 405)
# ---------------------------------------------------------------------------
@app.post("/", response_model=FloodScoreResponseDTO)
@app.post("/api", response_model=FloodScoreResponseDTO)
@app.post("/health", response_model=FloodScoreResponseDTO)
@app.post("/api/health", response_model=FloodScoreResponseDTO)
@app.post("/api/v1/flood/score", response_model=FloodScoreResponseDTO)
@app.post("/api/v1/score-base64", response_model=FloodScoreResponseDTO)
@app.post("/api/v1/score", response_model=FloodScoreResponseDTO)
@app.post("/flood/score", response_model=FloodScoreResponseDTO)
@app.post("/score-base64", response_model=FloodScoreResponseDTO)
@app.post("/score", response_model=FloodScoreResponseDTO)
def score_flood_image(request: FloodScoreRequestDTO):
    if not request.image_base64 or not request.image_base64.strip():
        return FloodScoreResponseDTO(**generate_severity_1_fallback("Empty or unattached report image"))

    result = analyze_flood_image(request.image_base64)
    return FloodScoreResponseDTO(**result)


# Catch-all fallback
@app.api_route("/{catchall:path}", methods=["GET", "HEAD", "POST"])
async def catch_all(catchall: str, request: Request):
    if request.method == "POST":
        try:
            body = await request.json()
            if isinstance(body, dict) and "image_base64" in body and body["image_base64"]:
                result = analyze_flood_image(body["image_base64"])
                return FloodScoreResponseDTO(**result)
        except Exception:
            pass
    return {
        "status": "UP",
        "service": "ResQFlow-AI-Vision",
        "engine": "Groq -> Gemini Vision Cascade",
        "deployment": "Vercel Serverless",
        "requested_path": f"/{catchall}",
        "url": str(request.url)
    }
