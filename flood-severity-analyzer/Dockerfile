FROM python:3.10-slim

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install minimal OS runtime packages required for OpenCV and healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU directly first (clean, lightweight wheel without large CUDA binaries)
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Copy dependencies and install remaining packages
COPY requirements-training.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code and model checkpoints
COPY src/ ./src/
COPY checkpoints_v2/ ./checkpoints_v2/
COPY .env ./.env

EXPOSE 8000

# Health check to verify FastAPI and PyTorch readiness
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start the full PyTorch + Gemini FastAPI server
CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8000"]
