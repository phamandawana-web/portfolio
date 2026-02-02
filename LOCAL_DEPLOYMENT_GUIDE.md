# Local Server Deployment Guide

## 🎯 Overview

This guide will help you deploy your academic website to your own local server. We'll cover:
1. Downloading and hosting your assets (photos, PDFs) locally
2. Setting up the application on your server
3. Configuring the environment
4. Running the services

---

## Part 1: Download Your Assets (Photos & PDFs)

### Step 1: Download All Your Uploaded Files

Create a script to download all your assets:

```bash
# Create assets directory
mkdir -p /path/to/your/server/public/assets/photos
mkdir -p /path/to/your/server/public/assets/pdfs

# Download Profile Photo
wget -O /path/to/your/server/public/assets/photos/prince-photo.jpg \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/k1emhgqc_prince-photo.jpg"

# Download CV
wget -O /path/to/your/server/public/assets/pdfs/CV-Prince-Hamandawana.pdf \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/9rjns1an_CV%20Prince%20Hamandawana%20%281%29.pdf"

# Download Teaching Philosophy
wget -O /path/to/your/server/public/assets/pdfs/Teaching-Philosophy.pdf \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/29cvi982_Prince%20Hamandawana%20Teaching%20Phylosophy.pdf"

# Download Lab Member Photos
wget -O /path/to/your/server/public/assets/photos/prof-taesun-chung.jpg \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/femlxl8q_Prof.%20Tae-Sun%20Chung.jpg"

wget -O /path/to/your/server/public/assets/photos/prof-sungsoo-kim.jpg \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/bsjf6zex_Prof.%20Sung-Soo%20Kim.jpg"

wget -O /path/to/your/server/public/assets/photos/prof-prince-hamandawana.jpg \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/pl0k33yz_Prof.%20Prince%20Hamandawana.jpg"

wget -O /path/to/your/server/public/assets/photos/prof-xiaohan-ma.jpg \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/xdc8nxe0_Prof.%20Xiaohan%20Ma.jpg"

wget -O /path/to/your/server/public/assets/photos/dr-preethika-kasu.jpg \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/aor9q3j9_Dr.%20Preethika%20Kasu.jpg"

wget -O /path/to/your/server/public/assets/photos/han-seunghyun.jpg \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/lci9tq52_Han%20Seung-Hyun%20%28%ED%95%9C%EC%8A%B9%ED%98%84%29.jpg"

wget -O /path/to/your/server/public/assets/photos/joo-jaehong.jpg \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/b2y32y5r_Joo%20Jae-Hong%20%28%EC%A3%BC%EC%9E%AC%ED%99%8D%29.jpg"

wget -O /path/to/your/server/public/assets/photos/sim-youngju.png \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/lxy4da57_Sim%20Young-Ju%20%28%EC%8B%AC%EC%98%81%EC%A3%BC%29.png"

wget -O /path/to/your/server/public/assets/photos/xu-meng.png \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/wkkd7h8o_Xu%20Meng.png"

wget -O /path/to/your/server/public/assets/photos/saqib-ali-haidery.png \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/d3gtjn7o_Saqib%20Ali%20Haidery.png"

wget -O /path/to/your/server/public/assets/photos/chen-zekang.png \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/fmyhn3tn_Chen%20Zekang.png"

wget -O /path/to/your/server/public/assets/photos/ahmad-ishaq.png \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/1ql9ew8h_Ahmad%20Ishaq.png"

wget -O /path/to/your/server/public/assets/photos/zhang-zhen.jpg \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/zcwyhdx8_Zhang%20Zhen.jpg"

wget -O /path/to/your/server/public/assets/photos/kudzai-nevanji.png \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/mbqn1ukr_Nevanji%20Kudzai.png"

wget -O /path/to/your/server/public/assets/photos/kao-seavpinh.png \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/8n0qwf6p_Kao%20Seavpinh.png"
```

---

## Part 2: Copy Application Files to Your Server

### Option A: Using SCP (Secure Copy)

```bash
# From your current location, copy the entire app to your server
scp -r /app your_username@your_server_ip:/path/to/deployment/

# Or use rsync for better efficiency
rsync -avz --exclude 'node_modules' --exclude '__pycache__' \
  /app/ your_username@your_server_ip:/path/to/deployment/
```

### Option B: Using Git

```bash
# Initialize git repository (if not already done)
cd /app
git init
git add .
git commit -m "Initial commit - Academic website"

# Push to your own git server or GitHub
git remote add origin your_git_repository_url
git push -u origin main

# On your local server, clone the repository
git clone your_git_repository_url /path/to/deployment/
```

---

## Part 3: Set Up Your Local Server

### Prerequisites

Install required software on your local server:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 or higher)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx (for production deployment)
sudo apt install -y nginx

# Install Supervisor (for process management)
sudo apt install -y supervisor
```

---

## Part 4: Configure the Application

### 1. Set Up Backend

```bash
cd /path/to/deployment/backend

# Create Python virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
nano .env
```

**Backend .env file:**
```bash
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017/
DB_NAME=academic_website

# Server Configuration
HOST=0.0.0.0
PORT=8001
```

### 2. Set Up Frontend

```bash
cd /path/to/deployment/frontend

# Install dependencies
npm install -g yarn  # or use npm
yarn install

# Configure environment variables
nano .env
```

**Frontend .env file:**
```bash
# Backend API URL
REACT_APP_BACKEND_URL=http://your_server_ip:8001

# Or if using Nginx reverse proxy
REACT_APP_BACKEND_URL=http://your_domain.com
```

### 3. Update Asset URLs in mockData.js

Replace all Emergent asset URLs with your local paths:

```bash
cd /path/to/deployment/frontend/src
nano mockData.js
```

**Replace URLs like this:**

```javascript
// OLD (Emergent hosted)
profileImage: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/k1emhgqc_prince-photo.jpg"

// NEW (Your server)
profileImage: "/assets/photos/prince-photo.jpg"

// OR if serving from a domain
profileImage: "http://your_domain.com/assets/photos/prince-photo.jpg"
```

Do this for ALL asset URLs in mockData.js:
- Profile photo
- CV PDF
- Teaching Philosophy PDF
- All 15 lab member photos

---

## Part 5: Build the Frontend

```bash
cd /path/to/deployment/frontend

# Build production version
yarn build

# This creates /path/to/deployment/frontend/build/ directory
```

---

## Part 6: Configure Nginx (Production Setup)

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/academic-website
```

**Nginx configuration:**

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;  # Or your IP

    # Serve static assets
    location /assets/ {
        alias /path/to/deployment/public/assets/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Serve frontend build
    location / {
        root /path/to/deployment/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/academic-website /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

---

## Part 7: Configure Supervisor (Process Management)

Create supervisor configuration for backend:

```bash
sudo nano /etc/supervisor/conf.d/academic-backend.conf
```

**Supervisor config:**

```ini
[program:academic-backend]
directory=/path/to/deployment/backend
command=/path/to/deployment/backend/venv/bin/python -m uvicorn server:app --host 0.0.0.0 --port 8001
user=your_username
autostart=true
autorestart=true
stderr_logfile=/var/log/academic-backend.err.log
stdout_logfile=/var/log/academic-backend.out.log
environment=PATH="/path/to/deployment/backend/venv/bin"
```

Reload supervisor:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start academic-backend
sudo supervisorctl status
```

---

## Part 8: Test the Deployment

### 1. Test Backend
```bash
curl http://localhost:8001/api/
# Should return: {"message":"Hello World"}
```

### 2. Test Frontend
```bash
# Open browser and navigate to:
http://your_server_ip
# or
http://your_domain.com
```

### 3. Check Logs
```bash
# Backend logs
sudo tail -f /var/log/academic-backend.out.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Part 9: SSL/HTTPS Setup (Optional but Recommended)

### Using Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your_domain.com -d www.your_domain.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

---

## Quick Deployment Checklist

- [ ] Install prerequisites (Node.js, Python, MongoDB, Nginx)
- [ ] Download all assets (photos, PDFs) to `/public/assets/`
- [ ] Copy application files to server
- [ ] Install backend dependencies (`pip install -r requirements.txt`)
- [ ] Install frontend dependencies (`yarn install`)
- [ ] Update `.env` files for both frontend and backend
- [ ] Update asset URLs in `mockData.js` to point to local paths
- [ ] Build frontend (`yarn build`)
- [ ] Configure Nginx
- [ ] Configure Supervisor for backend
- [ ] Start services
- [ ] Test deployment
- [ ] (Optional) Set up SSL certificate

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
sudo tail -f /var/log/academic-backend.err.log

# Common issues:
# - MongoDB not running: sudo systemctl start mongod
# - Port already in use: sudo lsof -i :8001
# - Permission issues: Check file ownership
```

### Frontend shows errors
```bash
# Check if backend URL is correct in .env
# Rebuild frontend: cd frontend && yarn build
# Clear browser cache
# Check Nginx logs: sudo tail -f /var/log/nginx/error.log
```

### Assets not loading
```bash
# Check file permissions: ls -la /path/to/public/assets/
# Make sure Nginx has read access
# Check Nginx configuration for /assets/ location
```

---

## Maintenance

### Update the website
```bash
# Pull latest changes (if using git)
git pull origin main

# Rebuild frontend
cd frontend && yarn build

# Restart backend
sudo supervisorctl restart academic-backend

# Reload Nginx
sudo systemctl reload nginx
```

### Backup
```bash
# Backup MongoDB
mongodump --db academic_website --out /backup/mongodb/

# Backup files
tar -czf website-backup-$(date +%Y%m%d).tar.gz /path/to/deployment/
```

---

## Alternative: Docker Deployment

If you prefer Docker, I can provide a Docker Compose configuration that makes deployment even easier. Let me know if you'd like that option!

---

**Need Help?** Feel free to ask if you encounter any issues during deployment!
