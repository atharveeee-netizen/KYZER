#!/usr/bin/env bash
# ==============================================================================
# 🚀 KYZER (CareDOM) Master Linux VM Deployment Script
# 1-Click Production Deployment for Google Cloud Compute Engine, AWS EC2 & DigitalOcean
# Supports Ubuntu 20.04 / 22.04 / 24.04 & Debian 11 / 12
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${GREEN}🏥 KYZER (CareDOM) — Master Linux VM Deployment Engine${NC}"
echo -e "${BLUE}==============================================================================${NC}"

# 1. Check Root / Sudo privileges
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}[!] Please run with sudo or as root: sudo bash deploy_vm.sh${NC}"
  exit 1
fi

# 2. Update System & Install Core Dependencies
echo -e "\n${BLUE}[1/6] Updating system packages and installing prerequisites...${NC}"
apt-get update -qq
apt-get install -y -qq curl wget git ufw apt-transport-https ca-certificates gnupg lsb-release

# 3. Check and Install Docker & Docker Compose
echo -e "\n${BLUE}[2/6] Checking Docker & Docker Compose environment...${NC}"
if ! command -v docker &> /dev/null; then
  echo -e "${YELLOW}Docker not found. Installing Docker CE...${NC}"
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  systemctl enable docker
  systemctl start docker
  rm -f get-docker.sh
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
  echo -e "${YELLOW}Installing Docker Compose Plugin...${NC}"
  apt-get install -y -qq docker-compose-plugin docker-compose
fi

echo -e "${GREEN}✓ Docker: $(docker --version)${NC}"

# 4. Configure Firewall (Open Ports 80, 443, 8000, 5432)
echo -e "\n${BLUE}[3/6] Configuring UFW firewall rules...${NC}"
ufw allow 22/tcp > /dev/null 2>&1 || true
ufw allow 80/tcp > /dev/null 2>&1 || true
ufw allow 443/tcp > /dev/null 2>&1 || true
ufw allow 8000/tcp > /dev/null 2>&1 || true
echo -e "${GREEN}✓ Firewall rules configured for HTTP, HTTPS, and FastAPI.${NC}"

# 5. Check Environment File (.env)
echo -e "\n${BLUE}[4/6] Verifying environment configuration (.env)...${NC}"
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo -e "${YELLOW}Created .env from .env.example. Please review API keys.${NC}"
  else
    cat << 'EOF' > .env
ENVIRONMENT=production
DATABASE_URL=postgresql://caredom_user:caredom_pass@db:5432/caredom_db
GEMINI_API_KEY=
IBM_QUANTUM_TOKEN=
EOF
    echo -e "${YELLOW}Generated standard .env file.${NC}"
  fi
fi

# 6. Build and Launch Containers
echo -e "\n${BLUE}[5/6] Building and starting CareDOM containers (FastAPI + PostGIS)...${NC}"
if docker compose version &> /dev/null; then
  docker compose down --remove-orphans > /dev/null 2>&1 || true
  docker compose up -d --build
else
  docker-compose down --remove-orphans > /dev/null 2>&1 || true
  docker-compose up -d --build
fi

# 7. Health Check Probing
echo -e "\n${BLUE}[6/6] Probing container health checks...${NC}"
PUBLIC_IP=$(curl -s -4 icanhazip.com || curl -s ifconfig.me || echo "YOUR_SERVER_IP")

MAX_RETRIES=20
COUNT=0
HEALTHY=false

while [ $COUNT -lt $MAX_RETRIES ]; do
  if curl -s -f http://localhost:8000/health > /dev/null 2>&1 || curl -s -f http://localhost:8000/api/v1/health > /dev/null 2>&1; then
    HEALTHY=true
    break
  fi
  echo -e "Waiting for services to initialize... ($((COUNT+1))/$MAX_RETRIES)"
  sleep 3
  COUNT=$((COUNT+1))
done

echo -e "\n${BLUE}==============================================================================${NC}"
if [ "$HEALTHY" = true ]; then
  echo -e "${GREEN}🎉 CONGRATULATIONS! KYZER IS FULLY DEPLOYED & LIVE ON LINUX VM!${NC}"
  echo -e "${BLUE}==============================================================================${NC}"
  echo -e "  • 🌐 REST API Base URL:    ${GREEN}http://${PUBLIC_IP}:8000${NC}"
  echo -e "  • 📑 Interactive Swagger:  ${GREEN}http://${PUBLIC_IP}:8000/docs${NC}"
  echo -e "  • 🩺 Health Check:         ${GREEN}http://${PUBLIC_IP}:8000/health${NC}"
  echo -e "  • 🗄️ PostGIS Database:     ${GREEN}localhost:5432 (caredom_db)${NC}"
  echo -e "  • 🗺️ Live Frontend Web:    ${GREEN}https://atharveeee-netizen.github.io/KYZER/${NC}"
  echo -e "${BLUE}==============================================================================${NC}"
else
  echo -e "${RED}[!] Health check timed out. Inspect container logs with:${NC}"
  echo -e "    ${YELLOW}docker logs caredom-api${NC}"
  echo -e "    ${YELLOW}docker logs caredom-postgres${NC}"
fi
