#!/bin/bash
# ==============================================================================
# CareDOM — Automated 1-Click Deployment Script for Oracle Cloud VM (OCI)
# Works on Ubuntu 20.04/22.04/24.04 and Oracle Linux 8/9 (x86_64 and ARM64 Ampere)
# ==============================================================================

set -e

echo "======================================================================"
echo "🚀 INITIATING CAREDOM DEPLOYMENT ON ORACLE CLOUD LINUX VM"
echo "======================================================================"

# 1. Detect OS Distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
fi

echo "📦 Detected OS: $OS"

# 2. Update System & Install Core Utilities
echo "🔄 Updating system packages and installing Git, Curl..."
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    sudo apt-get update -y
    sudo apt-get install -y git curl ufw ca-certificates gnupg iptables-persistent
elif [ "$OS" = "ol" ] || [ "$OS" = "rhel" ] || [ "$OS" = "centos" ]; then
    sudo dnf update -y
    sudo dnf install -y git curl iptables-services
fi

# 3. CRITICAL FOR ORACLE CLOUD: Open Port 8000 in Linux Firewall (iptables & ufw)
echo "🔓 Configuring Oracle VM Ingress Ports (Port 8000, 80, 443)..."
if command -v ufw >/dev/null 2>&1; then
    sudo ufw allow 8000/tcp || true
    sudo ufw allow 80/tcp || true
    sudo ufw allow 443/tcp || true
    sudo ufw allow 22/tcp || true
fi

# Oracle Cloud uses strict default iptables rules that block non-SSH ports
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8000 -j ACCEPT || true
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT || true
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT || true
sudo netfilter-persistent save || true

# 4. Install Docker Engine & Docker Compose
if ! command -v docker >/dev/null 2>&1; then
    echo "🐳 Installing Docker Engine..."
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker $USER || true
    sudo systemctl enable docker
    sudo systemctl start docker
fi

# 5. Clone or Pull Latest CareDOM Repository
WORKDIR="/home/$USER/KYZER"
if [ -d "$WORKDIR" ]; then
    echo "📂 Repository exists. Pulling latest updates from main..."
    cd "$WORKDIR"
    git pull origin main
else
    echo "📥 Cloning CareDOM from GitHub..."
    git clone https://github.com/atharveeee-netizen/KYZER.git "$WORKDIR"
    cd "$WORKDIR"
fi

# 6. Configure Production Environment Variables
if [ ! -f .env ]; then
    echo "⚙️ Creating default .env file..."
    cat <<EOF > .env
PORT=8000
DATABASE_URL=postgresql://caredom_user:caredom_pass@db:5432/caredom_db
ENVIRONMENT=production
EOF
fi

# 7. Build and Launch Containers
echo "🚀 Building and launching CareDOM Docker containers..."
sudo docker compose down || true
sudo docker compose up -d --build

# 8. Wait for Containers to Warm Up and Probe Health
echo "⏳ Waiting for FastAPI & PostGIS containers to initialize..."
sleep 10

echo "🔍 Probing container health..."
for i in {1..10}; do
    if curl -s http://localhost:8000/health | grep -q "ONLINE"; then
        echo "======================================================================"
        echo "✅ CAREDOM IS FULLY DEPLOYED & LIVE ON YOUR ORACLE CLOUD VM!"
        echo "👉 Health Check: http://localhost:8000/health"
        echo "👉 API Documentation: http://$(curl -s ifconfig.me):8000/docs"
        echo "======================================================================"
        exit 0
    fi
    echo "Waiting for health probe (Attempt $i/10)..."
    sleep 3
done

echo "⚠️ Container started, but healthcheck took longer than expected. Check logs with: sudo docker compose logs -f"
