import os
import io
import uuid
import time
import base64
import logging
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional

from model import FloodSeverityEvaluator

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("flood_api")

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="FloodSeverity AI API — v2.0",
    description=(
        "Production-grade flood severity scoring microservice.\n\n"
        "Architecture: CLIP Zero-Shot Semantic Gate + Calibrated CV Ensemble.\n"
        "Returns severity score 1–10 for integration with Spring Boot backend."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Model init ────────────────────────────────────────────────────────────────
MODEL_PATH = "flood_severity_model.pth"
_start = time.time()
logger.info("Initialising FloodSeverityEvaluator v2.0...")
evaluator = FloodSeverityEvaluator(
    model_path=MODEL_PATH if os.path.exists(MODEL_PATH) else None
)
logger.info("Model ready in %.1f s", time.time() - _start)

# Store startup time for uptime reporting
_startup_time = time.time()


# ═══════════════════════════════════════════════════════════════════════════════
#  DTOs
class FloodAssessmentResponse(BaseModel):
    severity_score: int = Field(..., ge=1, le=10, example=8)
    severity_level: str = Field(..., example="Severe")
    rescue_priority: str = Field(..., example="Critical")
    confidence: float = Field(..., ge=0.0, le=1.0, example=0.91)
    title: str = Field(..., example="Severe Flood Emergency: Ground Level & Vehicle Submergence")
    description: str = Field(..., example="CRITICAL: Severe flood inundation detected. Ground-floor living quarters and vehicles submerged.")
    what_is_in_image: str = Field(..., example="Heavy flood deluge covering 58.4% of image. Ground-floor submersion and trapped vehicles.")
    estimated_depth: str = Field(..., example="85 – 130 cm (Chest-Deep / Ground Floor)")
    road_access: str = Field(..., example="Only inflatable rescue crafts and NDRF boats can operate.")
    recommendations: list[str] = Field(default_factory=list)


class SimpleScoreResponse(FloodAssessmentResponse):
    pass


class FullAnalysisResponse(FloodAssessmentResponse):
    features: dict = Field(default_factory=dict)
    request_id: str = Field(..., example="a1b2c3d4")
    processing_ms: float = Field(..., example=342.1)


class Base64ImageRequest(BaseModel):
    image_base64: str = Field(
        ...,
        description="Base64-encoded image string (with or without data URI prefix)",
    )


class HealthResponse(BaseModel):
    status: str
    version: str
    clip_active: bool
    cv_active: bool
    uptime_seconds: float


# ═══════════════════════════════════════════════════════════════════════════════
#  Shared helpers
# ═══════════════════════════════════════════════════════════════════════════════
MAX_IMAGE_BYTES = 15 * 1024 * 1024  # 15 MB


def _load_image_from_bytes(raw: bytes) -> Image.Image:
    if len(raw) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds 15 MB limit.")
    try:
        return Image.open(io.BytesIO(raw))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Cannot decode image: {exc}")


def _validate_image_content_type(content_type: str) -> None:
    if not content_type or not content_type.startswith("image/"):
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported media type '{content_type}'. Send an image file.",
        )


# ═══════════════════════════════════════════════════════════════════════════════
#  Endpoints
# ═══════════════════════════════════════════════════════════════════════════════

# ── Root ─────────────────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
def root():
    return {
        "service": "FloodSeverity AI API v2.0",
        "status": "ONLINE",
        "endpoints": {
            "simple_score": "POST /api/v1/score",
            "assessment":   "POST /api/v1/predict",
            "full_analysis": "POST /api/v1/analyze",
            "base64_score":  "POST /api/v1/score-base64",
            "health":        "GET  /api/v1/health",
            "docs":          "GET  /docs",
        },
    }


# ── Health ────────────────────────────────────────────────────────────────────
@app.get(
    "/api/v1/health",
    response_model=HealthResponse,
    summary="Service health and model status",
    tags=["Utility"],
)
def health():
    return HealthResponse(
        status="ONLINE",
        version="2.0.0",
        clip_active=evaluator.clip_evaluator.available if hasattr(evaluator, "clip_evaluator") else True,
        cv_active=True,
        uptime_seconds=round(time.time() - _startup_time, 1),
    )


# ── Simple score — file upload ────────────────────────────────────────────────
@app.post(
    "/api/v1/score",
    response_model=FloodAssessmentResponse,
    summary="Returns complete assessment + severity score (1–10) — Spring Boot integration endpoint",
    tags=["Scoring"],
)
async def get_score(file: UploadFile = File(...)):
    _validate_image_content_type(file.content_type or "")
    image = _load_image_from_bytes(await file.read())
    result = evaluator.evaluate(image)
    logger.info(
        "score: file=%s score=%d level=%s title='%s' conf=%.2f",
        file.filename, result["severity_score"],
        result["severity_level"], result["title"], result["confidence"],
    )
    return FloodAssessmentResponse(
        severity_score=result["severity_score"],
        severity_level=result["severity_level"],
        rescue_priority=result["rescue_priority"],
        confidence=result["confidence"],
        title=result["title"],
        description=result["description"],
        what_is_in_image=result["what_is_in_image"],
        estimated_depth=result["estimated_depth"],
        road_access=result["road_access"],
        recommendations=result["recommendations"],
    )


# ── Assessment — file upload ──────────────────────────────────────────────────
@app.post(
    "/api/v1/predict",
    response_model=FloodAssessmentResponse,
    summary="Returns score + severity level + priority + recommendations + narrative",
    tags=["Scoring"],
)
async def predict(file: UploadFile = File(...)):
    _validate_image_content_type(file.content_type or "")
    image = _load_image_from_bytes(await file.read())
    r = evaluator.evaluate(image)
    return FloodAssessmentResponse(
        severity_score=r["severity_score"],
        severity_level=r["severity_level"],
        rescue_priority=r["rescue_priority"],
        confidence=r["confidence"],
        title=r["title"],
        description=r["description"],
        what_is_in_image=r["what_is_in_image"],
        estimated_depth=r["estimated_depth"],
        road_access=r["road_access"],
        recommendations=r["recommendations"],
    )


# ── Full analysis — file upload (debug / dashboard) ───────────────────────────
@app.post(
    "/api/v1/analyze",
    response_model=FullAnalysisResponse,
    summary="Full analysis including CV features and CLIP category breakdown",
    tags=["Scoring"],
)
async def analyze(file: UploadFile = File(...)):
    _validate_image_content_type(file.content_type or "")
    raw = await file.read()
    image = _load_image_from_bytes(raw)
    req_id = uuid.uuid4().hex[:8]

    t0 = time.perf_counter()
    r = evaluator.evaluate(image)
    elapsed_ms = round((time.perf_counter() - t0) * 1000, 1)

    logger.info(
        "analyze: req=%s score=%d conf=%.2f ms=%.0f",
        req_id, r["severity_score"], r["confidence"], elapsed_ms,
    )
    return FullAnalysisResponse(
        severity_score=r["severity_score"],
        severity_level=r["severity_level"],
        rescue_priority=r["rescue_priority"],
        confidence=r["confidence"],
        title=r["title"],
        description=r["description"],
        what_is_in_image=r["what_is_in_image"],
        estimated_depth=r["estimated_depth"],
        road_access=r["road_access"],
        recommendations=r["recommendations"],
        features=r["features"],
        request_id=req_id,
        processing_ms=elapsed_ms,
    )


# ── Simple score — base64 ─────────────────────────────────────────────────────
@app.post(
    "/api/v1/score-base64",
    response_model=FloodAssessmentResponse,
    summary="Returns complete severity assessment from base64-encoded image",
    tags=["Scoring"],
)
async def score_base64(request: Base64ImageRequest):
    try:
        b64 = request.image_base64
        if "," in b64:              # strip data URI prefix if present
            b64 = b64.split(",", 1)[1]
        raw = base64.b64decode(b64)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid base64 payload: {exc}")

    image = _load_image_from_bytes(raw)
    result = evaluator.evaluate(image)
    return FloodAssessmentResponse(
        severity_score=result["severity_score"],
        severity_level=result["severity_level"],
        rescue_priority=result["rescue_priority"],
        confidence=result["confidence"],
        title=result["title"],
        description=result["description"],
        what_is_in_image=result["what_is_in_image"],
        estimated_depth=result["estimated_depth"],
        road_access=result["road_access"],
        recommendations=result["recommendations"],
    )


# ── Global exception handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please check server logs."},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
