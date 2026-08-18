#!/bin/bash
# ==============================================================================
# CareDOM Google Cloud Run Production Deployment Script
# Targets Singapore (asia-southeast1) for zero-latency colocation with Neon DB
# ==============================================================================

set -e

PROJECT_ID=${GCP_PROJECT_ID:-"caredom-health"}
REGION=${GCP_REGION:-"asia-southeast1"} # Singapore region colocated with Neon DB (ap-southeast-1)
IMAGE_NAME="gcr.io/${PROJECT_ID}/caredom-backend:latest"
SERVICE_NAME="caredom-api"

echo "=========================================================="
echo "🚀 Deploying CareDOM Backend to Google Cloud Run"
echo "Project: ${PROJECT_ID} | Region: ${REGION}"
echo "Colocation Target: Neon PostgreSQL (ap-southeast-1)"
echo "=========================================================="

# 1. Build and push Docker image via Google Cloud Build
echo "📦 Building Linux container image..."
gcloud builds submit --tag ${IMAGE_NAME} .

# 2. Deploy to Google Cloud Run with Environment Variables
echo "☁️ Deploying to Cloud Run with auto-scaling..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 10 \
  --port 8000 \
  --set-env-vars ENVIRONMENT=production,DATABASE_URL="${DATABASE_URL}",GEMINI_API_KEY="${GEMINI_API_KEY}"

echo "=========================================================="
echo "✅ DEPLOYMENT COMPLETE! Your live API endpoint is active in ${REGION}."
echo "=========================================================="
