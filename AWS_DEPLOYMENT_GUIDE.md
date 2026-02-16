# AWS Deployment Guide - Academic Website
## Complete Step-by-Step Instructions

---

## 📋 Overview

This guide covers deploying your academic website (React + FastAPI + MongoDB) on AWS using:
- **EC2** for hosting the application
- **Route 53** for DNS management
- **S3** for static assets (photos, PDFs)
- **DocumentDB or MongoDB Atlas** for database
- **CloudFront** (optional) for CDN
- **Certificate Manager** for SSL/HTTPS

**Estimated Time:** 2-3 hours
**Estimated Monthly Cost:** $20-50 (depending on usage)

---

## Part 1: Prerequisites & AWS Account Setup

### Step 1.1: Create AWS Account

1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the registration process
4. Add payment method (credit card required)
5. Complete identity verification

### Step 1.2: Install AWS CLI (Optional but Recommended)

**For Ubuntu/Debian:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

**For MacOS:**
```bash
brew install awscli
```

**For Windows:**
Download from: https://aws.amazon.com/cli/

**Configure AWS CLI:**
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1 (or your preferred region)
# Default output format: json
```

---

## Part 2: Download and Prepare Assets

### Step 2.1: Download All Assets from Emergent

On your local machine, create the download script:

```bash
# Create download directory
mkdir -p ~/academic-website-deploy
cd ~/academic-website-deploy

# Download the provided script from the current server
# Or create it manually with all the wget commands
```

Run the asset download script:
```bash
bash /app/download-assets.sh
# When prompted, enter: ./assets
```

This will download:
- 1 profile photo
- 2 PDFs (CV, Teaching Philosophy)
- 1 diagram (IEEE Access paper)
- 15 lab member photos

### Step 2.2: Package Application Code

```bash
# On your current server, create a deployment package
cd /app
tar -czf ~/academic-website.tar.gz \
  --exclude='node_modules' \
  --exclude='__pycache__' \
  --exclude='.git' \
  --exclude='frontend/build' \
  --exclude='backend/venv' \
  frontend/ backend/ package.json requirements.txt

# This creates a compressed archive of your application
```

---

## Part 3: Set Up AWS S3 for Static Assets

### Step 3.1: Create S3 Bucket

**Via AWS Console:**
1. Log in to AWS Console: https://console.aws.amazon.com/
2. Navigate to S3 (search "S3" in the top search bar)
3. Click "Create bucket"
4. **Bucket name:** `academic-website-assets-[your-unique-name]`
   - Example: `academic-website-assets-prince-2026`
   - Must be globally unique
5. **Region:** Choose closest to your target audience (e.g., us-east-1)
6. **Block Public Access settings:** UNCHECK all boxes (we need public access for photos)
7. Click "Create bucket"

**Via AWS CLI:**
```bash
aws s3 mb s3://academic-website-assets-prince-2026 --region us-east-1
```

### Step 3.2: Configure Bucket for Public Access

1. Click on your bucket name
2. Go to "Permissions" tab
3. Edit "Bucket policy"
4. Add this policy (replace `YOUR-BUCKET-NAME`):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

5. Save changes

### Step 3.3: Upload Assets to S3

**Via AWS Console:**
1. Click on your bucket
2. Click "Upload"
3. Drag and drop your assets folder
4. Click "Upload"

**Via AWS CLI:**
```bash
cd ~/academic-website-deploy
aws s3 sync ./assets/ s3://academic-website-assets-prince-2026/assets/ \
  --acl public-read
```

### Step 3.4: Get Asset URLs

After upload, your assets will be accessible at:
```
https://academic-website-assets-prince-2026.s3.amazonaws.com/assets/photos/prince-photo.jpg
https://academic-website-assets-prince-2026.s3.amazonaws.com/assets/pdfs/CV-Prince-Hamandawana.pdf
```

**Note these URLs - you'll need them later!**

---

## Part 4: Set Up EC2 Instance

### Step 4.1: Launch EC2 Instance

1. Go to EC2 Dashboard in AWS Console
2. Click "Launch Instance"

**Configure Instance:**

**Step 1: Choose AMI**
- Select: **Ubuntu Server 22.04 LTS (HVM), SSD Volume Type**
- Click "Select"

**Step 2: Choose Instance Type**
- Select: **t3.small** (2 vCPU, 2 GB RAM) - $0.0208/hour ≈ $15/month
- For lower cost: **t3.micro** (2 vCPU, 1 GB RAM) - $0.0104/hour ≈ $7.50/month
- Click "Next: Configure Instance Details"

**Step 3: Configure Instance**
- Keep defaults
- Click "Next: Add Storage"

**Step 4: Add Storage**
- Size: **20 GB** (minimum) or **30 GB** (recommended)
- Volume Type: General Purpose SSD (gp3)
- Click "Next: Add Tags"

**Step 5: Add Tags**
- Add tag: Key = `Name`, Value = `Academic-Website-Server`
- Click "Next: Configure Security Group"

**Step 6: Configure Security Group**
- Create a new security group
- Security group name: `academic-website-sg`
- Add these rules:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | My IP | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS |
| Custom TCP | TCP | 8001 | 0.0.0.0/0 | Backend API (temporary) |

- Click "Review and Launch"

**Step 7: Review and Launch**
- Click "Launch"
- **Key Pair:** 
  - Select "Create a new key pair"
  - Key pair name: `academic-website-key`
  - Download the `.pem` file
  - **IMPORTANT:** Save this file securely - you can't download it again!
- Click "Launch Instances"

### Step 4.2: Connect to EC2 Instance

**Set permissions for key file:**
```bash
chmod 400 ~/Downloads/academic-website-key.pem
```

**Get your instance's public IP:**
1. Go to EC2 Dashboard
2. Click "Instances"
3. Find your instance
4. Copy the "Public IPv4 address" (e.g., 54.123.45.67)

**SSH into your instance:**
```bash
ssh -i ~/Downloads/academic-website-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Example:
# ssh -i ~/Downloads/academic-website-key.pem ubuntu@54.123.45.67
```

You should now be connected to your EC2 instance!

---

## Part 5: Set Up Server Environment

### Step 5.1: Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 5.2: Install Required Software

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version

# Install Yarn
sudo npm install -g yarn

# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod

# Install Nginx
sudo apt install -y nginx

# Install Supervisor
sudo apt install -y supervisor

# Install other utilities
sudo apt install -y git curl wget unzip
```

---

## Part 6: Deploy Application

### Step 6.1: Transfer Application Files

**From your local machine:**
```bash
# Upload the tar.gz file to EC2
scp -i ~/Downloads/academic-website-key.pem \
  ~/academic-website.tar.gz \
  ubuntu@YOUR_EC2_PUBLIC_IP:/home/ubuntu/

# Example:
# scp -i ~/Downloads/academic-website-key.pem ~/academic-website.tar.gz ubuntu@54.123.45.67:/home/ubuntu/
```

**On EC2 instance:**
```bash
# Extract the application
cd /home/ubuntu
tar -xzf academic-website.tar.gz

# Create deployment directory
sudo mkdir -p /var/www/academic-website
sudo mv frontend backend /var/www/academic-website/
sudo chown -R ubuntu:ubuntu /var/www/academic-website
```

### Step 6.2: Set Up Backend

```bash
cd /var/www/academic-website/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
nano .env
```

**Add to backend/.env:**
```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=academic_website
CORS_ORIGINS=*
```

Save and exit (Ctrl+X, Y, Enter)

### Step 6.3: Set Up Frontend

```bash
cd /var/www/academic-website/frontend

# Install dependencies
yarn install

# Update .env file with your S3 URLs
nano .env
```

**Add to frontend/.env:**
```bash
REACT_APP_BACKEND_URL=http://YOUR_EC2_PUBLIC_IP
```

Save and exit

**Update mockData.js with S3 URLs:**
```bash
nano src/mockData.js
```

Replace all Emergent asset URLs with your S3 URLs:
```javascript
// Example:
profileImage: "https://academic-website-assets-prince-2026.s3.amazonaws.com/assets/photos/prince-photo.jpg",
cv: "https://academic-website-assets-prince-2026.s3.amazonaws.com/assets/pdfs/CV-Prince-Hamandawana.pdf",
// ... etc for all assets
```

Save and exit

**Build frontend:**
```bash
yarn build
```

This creates the production build in `/var/www/academic-website/frontend/build/`

---

## Part 7: Configure Nginx

### Step 7.1: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/academic-website
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;  # Or your domain name

    # Serve frontend build
    location / {
        root /var/www/academic-website/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Enable gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
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
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts for Google Scholar requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/academic-website-access.log;
    error_log /var/log/nginx/academic-website-error.log;
}
```

Save and exit

### Step 7.2: Enable Site and Test

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/academic-website /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# If test passes, restart Nginx
sudo systemctl restart nginx
```

---

## Part 8: Configure Supervisor for Backend

### Step 8.1: Create Supervisor Configuration

```bash
sudo nano /etc/supervisor/conf.d/academic-backend.conf
```

**Add this configuration:**
```ini
[program:academic-backend]
directory=/var/www/academic-website/backend
command=/var/www/academic-website/backend/venv/bin/python -m uvicorn server:app --host 0.0.0.0 --port 8001 --workers 2
user=ubuntu
autostart=true
autorestart=true
stderr_logfile=/var/log/academic-backend.err.log
stdout_logfile=/var/log/academic-backend.out.log
environment=PATH="/var/www/academic-website/backend/venv/bin"
```

Save and exit

### Step 8.2: Start Backend Service

```bash
# Reload supervisor
sudo supervisorctl reread
sudo supervisorctl update

# Start the service
sudo supervisorctl start academic-backend

# Check status
sudo supervisorctl status

# Should show:
# academic-backend                 RUNNING   pid 1234, uptime 0:00:05
```

---

## Part 9: Test Your Deployment

### Step 9.1: Test Backend API

```bash
curl http://localhost:8001/api/
# Should return: {"message":"Hello World"}

curl http://localhost:8001/api/publications/scholar/adgtAm8AAAAJ?max_publications=1
# Should return publication data
```

### Step 9.2: Test Frontend

Open your browser and go to:
```
http://YOUR_EC2_PUBLIC_IP
```

You should see your academic website!

### Step 9.3: Check Logs

```bash
# Backend logs
sudo tail -f /var/log/academic-backend.out.log
sudo tail -f /var/log/academic-backend.err.log

# Nginx logs
sudo tail -f /var/log/nginx/academic-website-access.log
sudo tail -f /var/log/nginx/academic-website-error.log
```

---

## Part 10: Set Up Domain Name (Optional but Recommended)

### Step 10.1: Register Domain

Register a domain through:
- AWS Route 53
- Namecheap
- GoDaddy
- Google Domains
- Any other registrar

Example domain: `princehamandawana.com`

### Step 10.2: Configure Route 53 (if using AWS)

**If you registered domain elsewhere, skip to Step 10.3**

1. Go to Route 53 in AWS Console
2. Click "Hosted zones"
3. Click "Create hosted zone"
4. Domain name: `your-domain.com`
5. Type: Public hosted zone
6. Click "Create hosted zone"

**Create A Record:**
1. Click "Create record"
2. Record name: (leave empty for root domain) or `www`
3. Record type: A
4. Value: YOUR_EC2_PUBLIC_IP
5. Click "Create records"

### Step 10.3: Update Domain DNS (if registered elsewhere)

At your domain registrar:
1. Find DNS settings
2. Add A record:
   - Type: A
   - Host: @ (or leave empty)
   - Value: YOUR_EC2_PUBLIC_IP
   - TTL: 3600
3. Add CNAME record for www:
   - Type: CNAME
   - Host: www
   - Value: your-domain.com
   - TTL: 3600

Wait 1-24 hours for DNS propagation

### Step 10.4: Update Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/academic-website
```

Change:
```nginx
server_name YOUR_EC2_PUBLIC_IP;
```

To:
```nginx
server_name your-domain.com www.your-domain.com;
```

Restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Step 10.5: Update Frontend .env

```bash
cd /var/www/academic-website/frontend
nano .env
```

Change:
```bash
REACT_APP_BACKEND_URL=http://YOUR_EC2_PUBLIC_IP
```

To:
```bash
REACT_APP_BACKEND_URL=https://your-domain.com
```

Rebuild frontend:
```bash
yarn build
```

---

## Part 11: Set Up SSL/HTTPS with Let's Encrypt (Free)

### Step 11.1: Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Step 11.2: Obtain SSL Certificate

**Make sure your domain is pointing to your EC2 IP first!**

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts:
1. Enter your email address
2. Agree to terms of service
3. Choose whether to redirect HTTP to HTTPS (select yes/2)

Certbot will automatically:
- Obtain certificate
- Update Nginx configuration
- Set up auto-renewal

### Step 11.3: Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

If successful, your SSL certificate will auto-renew every 90 days!

### Step 11.4: Verify HTTPS

Open browser and go to:
```
https://your-domain.com
```

You should see:
- 🔒 Padlock icon in address bar
- Your website loads securely

---

## Part 12: Optimize and Secure

### Step 12.1: Enable Firewall

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### Step 12.2: Set Up Automatic Security Updates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
# Select "Yes"
```

### Step 12.3: Create Backup Script

```bash
sudo nano /usr/local/bin/backup-website.sh
```

```bash
#!/bin/bash
# Academic Website Backup Script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --db academic_website --out $BACKUP_DIR/mongodb_$DATE

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/academic-website

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "mongodb_*" -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $DATE"
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/backup-website.sh
```

### Step 12.4: Schedule Automatic Backups

```bash
sudo crontab -e
```

Add this line (daily backup at 2 AM):
```
0 2 * * * /usr/local/bin/backup-website.sh >> /var/log/website-backup.log 2>&1
```

---

## Part 13: Set Up CloudWatch Monitoring (Optional)

### Step 13.1: Install CloudWatch Agent

```bash
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

### Step 13.2: Configure IAM Role

1. Go to IAM in AWS Console
2. Create role for EC2
3. Attach policy: `CloudWatchAgentServerPolicy`
4. Attach role to your EC2 instance

---

## Part 14: Performance Optimization

### Step 14.1: Enable Nginx Caching

```bash
sudo nano /etc/nginx/sites-available/academic-website
```

Add inside server block:
```nginx
# Cache static assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### Step 14.2: Enable Compression

Already included in the Nginx config above with gzip settings.

---

## Part 15: Maintenance & Updates

### Regular Maintenance Tasks

**Weekly:**
```bash
# SSH into server
ssh -i ~/Downloads/academic-website-key.pem ubuntu@YOUR_EC2_IP

# Check service status
sudo supervisorctl status
sudo systemctl status nginx
sudo systemctl status mongod

# Check disk space
df -h

# Check logs for errors
sudo tail -50 /var/log/academic-backend.err.log
sudo tail -50 /var/log/nginx/academic-website-error.log
```

**Monthly:**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Restart services
sudo supervisorctl restart academic-backend
sudo systemctl restart nginx
```

### Updating Website Content

**For mockData.js changes:**
```bash
# Edit the file
nano /var/www/academic-website/frontend/src/mockData.js

# Rebuild frontend
cd /var/www/academic-website/frontend
yarn build

# No restart needed - Nginx serves the new build automatically
```

**For backend code changes:**
```bash
# Edit files
nano /var/www/academic-website/backend/server.py

# Restart backend
sudo supervisorctl restart academic-backend
```

---

## Part 16: Cost Optimization

### Estimated Monthly Costs

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| EC2 t3.small | 2 vCPU, 2 GB RAM | ~$15 |
| EBS Storage | 30 GB | ~$3 |
| S3 Storage | 5 GB | ~$0.12 |
| Data Transfer | 10 GB/month | ~$1 |
| Route 53 | Hosted zone | ~$0.50 |
| **Total** | | **~$20/month** |

### Cost Saving Tips

1. **Use Reserved Instances:** Save up to 40% with 1-year commitment
2. **Use t3.micro:** Save 50% if traffic is low (not recommended for production)
3. **Stop instance when not needed:** For development/testing
4. **Use CloudFront:** Cache assets, reduce data transfer costs
5. **Monitor with AWS Cost Explorer**

---

## Part 17: Troubleshooting

### Backend Not Starting
```bash
# Check logs
sudo tail -100 /var/log/academic-backend.err.log

# Common issues:
# 1. Python dependencies missing
cd /var/www/academic-website/backend
source venv/bin/activate
pip install -r requirements.txt

# 2. MongoDB not running
sudo systemctl status mongod
sudo systemctl start mongod

# 3. Port already in use
sudo lsof -i :8001
```

### Frontend Shows Blank Page
```bash
# Check Nginx logs
sudo tail -100 /var/log/nginx/academic-website-error.log

# Rebuild frontend
cd /var/www/academic-website/frontend
yarn build

# Check Nginx syntax
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check Nginx SSL configuration
sudo nano /etc/nginx/sites-available/academic-website
```

### Google Scholar Not Loading
```bash
# Check backend logs
sudo tail -100 /var/log/academic-backend.out.log

# Test manually
curl "http://localhost:8001/api/publications/scholar/adgtAm8AAAAJ?max_publications=1"

# Clear cache
# Delete files in /tmp/scholar_cache/
sudo rm -rf /tmp/scholar_cache/*

# Restart backend
sudo supervisorctl restart academic-backend
```

---

## Part 18: Alternative: Using AWS Lightsail (Simpler Option)

If EC2 seems complex, consider AWS Lightsail:

### Benefits:
- Fixed monthly pricing ($5, $10, $20/month)
- Simpler interface
- Includes static IP
- Easier to manage

### Steps:
1. Go to https://lightsail.aws.amazon.com/
2. Create instance
3. Choose OS: Ubuntu 22.04
4. Choose plan: $10/month (1 GB RAM)
5. Follow same deployment steps as EC2

---

## Quick Reference Commands

### Connect to Server
```bash
ssh -i ~/Downloads/academic-website-key.pem ubuntu@YOUR_EC2_IP
```

### Restart Services
```bash
sudo supervisorctl restart academic-backend
sudo systemctl restart nginx
```

### View Logs
```bash
sudo tail -f /var/log/academic-backend.out.log
sudo tail -f /var/log/nginx/academic-website-access.log
```

### Update Content
```bash
cd /var/www/academic-website/frontend
nano src/mockData.js
yarn build
```

---

## Support Resources

- **AWS Documentation:** https://docs.aws.amazon.com/
- **AWS Support:** https://console.aws.amazon.com/support/
- **Ubuntu Documentation:** https://help.ubuntu.com/
- **Nginx Documentation:** https://nginx.org/en/docs/
- **Let's Encrypt:** https://letsencrypt.org/docs/

---

## Conclusion

Your academic website is now deployed on AWS! 🎉

**What you achieved:**
- ✅ Production-ready server on AWS EC2
- ✅ Static assets hosted on S3
- ✅ Custom domain with SSL/HTTPS
- ✅ Automatic backups
- ✅ Professional infrastructure
- ✅ Scalable and secure

**Next Steps:**
1. Test all features thoroughly
2. Set up monitoring alerts
3. Share your website URL
4. Keep content updated

**Your website is live at:** `https://your-domain.com`

---

**Guide Version:** 1.0
**Last Updated:** February 2026
**Feedback:** Please report any issues or suggestions
