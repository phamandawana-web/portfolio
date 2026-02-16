#!/bin/bash

# Quick Deployment Script for Academic Website
# This script automates the deployment process

set -e  # Exit on error

echo "======================================"
echo "Academic Website - Quick Deploy Script"
echo "======================================"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "Error: Please run as normal user, not root"
    exit 1
fi

# Variables
DEPLOY_DIR="/var/www/academic-website"
APP_ARCHIVE="$HOME/academic-website.tar.gz"
ASSETS_DIR="$HOME/website-deployment/assets"

echo "Step 1: Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "Node.js not found. Please install first."; exit 1; }
command -v python3.11 >/dev/null 2>&1 || { echo "Python 3.11 not found. Please install first."; exit 1; }
command -v mongod >/dev/null 2>&1 || { echo "MongoDB not found. Please install first."; exit 1; }
echo "✓ Prerequisites check passed"
echo ""

echo "Step 2: Creating deployment directory..."
sudo mkdir -p $DEPLOY_DIR
sudo chown -R $USER:$USER $DEPLOY_DIR
echo "✓ Directory created: $DEPLOY_DIR"
echo ""

echo "Step 3: Extracting application..."
if [ ! -f "$APP_ARCHIVE" ]; then
    echo "Error: Application archive not found at $APP_ARCHIVE"
    echo "Please upload academic-website.tar.gz to your home directory"
    exit 1
fi
tar -xzf $APP_ARCHIVE -C $HOME
mv $HOME/frontend $HOME/backend $DEPLOY_DIR/
echo "✓ Application extracted"
echo ""

echo "Step 4: Copying assets..."
if [ -d "$ASSETS_DIR" ]; then
    mkdir -p $DEPLOY_DIR/public/assets
    cp -r $ASSETS_DIR/* $DEPLOY_DIR/public/assets/
    echo "✓ Assets copied"
else
    echo "⚠ Assets not found at $ASSETS_DIR"
    echo "  Run download-assets.sh first"
fi
echo ""

echo "Step 5: Setting up backend..."
cd $DEPLOY_DIR/backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate
echo "✓ Backend dependencies installed"
echo ""

echo "Step 6: Setting up frontend..."
cd $DEPLOY_DIR/frontend
yarn install
echo "✓ Frontend dependencies installed"
echo ""

echo "======================================"
echo "✓ Deployment Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Configure environment files:"
echo "   - $DEPLOY_DIR/backend/.env"
echo "   - $DEPLOY_DIR/frontend/.env"
echo "2. Update asset URLs in mockData.js"
echo "3. Build frontend: cd $DEPLOY_DIR/frontend && yarn build"
echo "4. Configure Nginx (copy configs/nginx.conf)"
echo "5. Configure Supervisor (copy configs/supervisor.conf)"
echo "6. Start services"
echo ""
echo "See guides/01-deployment-guide.md for detailed instructions"
echo ""
