#!/bin/bash
# ==============================================================================
# CareDOM Google Cloud Run 1-Click Production Deployment Script
# ==============================================================================

set -e

PROJECT_ID=${GCP_PROJECT_ID:-"caredom-health"}
REGION=${GCP_REGION:-"asia-south1"} # Mumbai, India region for low latency
IMAGE_NAME="gcr.io/${PROJECT_ID}/caredom-backend:latest"
SERVICE_NAME="caredom-api"

echo "=========================================================="
echo "🚀 Deploying CareDOM Linux Backend to Google Cloud Run"
echo "Project: ${PROJECT_ID} | Region: ${REGION}"
echo "=========================================================="

# 1. Build and push Docker image via Google Cloud Build
echo "📦 Building Linux container image..."
gcloud builds submit --tag ${IMAGE_NAME} .

# 2. Deploy to Google Cloud Run
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
  --set-env-vars ENVIRONMENT=production

echo "=========================================================="
echo "✅ DEPLOYMENT COMPLETE! Your live API endpoint is active."
echo "=========================================================="
