# ==============================================================================
# CareDOM Autonomous Healthcare Supply Chain Platform — Production Linux Container
# Debian Slim Base with OpenMP Multi-Core Parallelism & OpenCV Headless
# ==============================================================================

FROM python:3.10-slim-bullseye AS base

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    PORT=8000

WORKDIR /app

# Install native Linux system dependencies (C++ compilers, OpenMP, OpenCV headless deps)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    libgl1 \
    libglib2.0-0 \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy only existing application source trees
COPY ai_engine/ ./ai_engine/
COPY backend/ ./backend/
COPY docs/ ./docs/

# Create runtime directories
RUN mkdir -p ./voice ./data ./outputs

# Expose port for Cloud Run and local containers
EXPOSE 8000

# Healthcheck probe for Linux container orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Production Entrypoint via Async Uvicorn ASGI Server
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
