# Local Linux Server Deployment Guide
## Complete Step-by-Step Instructions

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Server Preparation](#server-preparation)
4. [Install Software Dependencies](#install-dependencies)
5. [Download Assets](#download-assets)
6. [Deploy Application](#deploy-application)
7. [Configure Nginx](#configure-nginx)
8. [Configure Supervisor](#configure-supervisor)
9. [Test Deployment](#test-deployment)
10. [Setup Domain Name](#setup-domain-name)
11. [Enable SSL/HTTPS](#enable-ssl)
12. [Security Hardening](#security-hardening)
13. [Setup Backups](#setup-backups)
14. [Monitoring](#monitoring)
15. [Maintenance](#maintenance)

---

## 1. Introduction {#introduction}

This guide will help you deploy your academic website on your own Linux server. Whether it's:
- A physical server in your office
- A home server (like Raspberry Pi)
- A VPS from any provider
- A virtual machine

**Time Required:** 2-3 hours
**Difficulty:** Intermediate
**Cost:** $0 (using existing hardware)

---

## 2. Prerequisites {#prerequisites}

### Hardware Requirements

**Minimum:**
- 2 CPU cores
- 2 GB RAM
- 20 GB storage
- Network connection

**Recommended:**
- 4 CPU cores
- 4 GB RAM
- 50 GB storage
- Static IP address (or Dynamic DNS)

### Software Requirements

**Supported Operating Systems:**
- Ubuntu 20.04 LTS or newer
- Debian 11 or newer
- CentOS 8 or newer
- RHEL 8 or newer
- Fedora 35 or newer

**Access Requirements:**
- Root access or sudo privileges
- SSH access to the server
- Basic command-line knowledge

### Network Requirements

- **Internet connection** for initial setup
- **Port forwarding** (if behind router):
  - Port 80 (HTTP)
  - Port 443 (HTTPS)
  - Port 22 (SSH - for management)

### On Your Local Computer

- SSH client (built-in on Linux/Mac, PuTTY on Windows)
- SCP/SFTP client (for file transfer)
- Terminal or command prompt
- Web browser for testing

---

## 3. Server Preparation {#server-preparation}

### Step 3.1: Connect to Your Server

**If server is on same network:**
```bash
ssh username@192.168.1.100
# Replace with your server's local IP
```

**If server is remote:**
```bash
ssh username@your-server-domain.com
# Or: ssh username@your-public-ip
```

### Step 3.2: Update System

```bash
# Update package lists
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y

# Install basic utilities
sudo apt install -y curl wget git unzip software-properties-common
```

**For CentOS/RHEL:**
```bash
sudo dnf update -y
sudo dnf install -y curl wget git unzip
```

### Step 3.3: Create Deployment User (Optional but Recommended)

```bash
# Create user for running the application
sudo adduser webapp
sudo usermod -aG sudo webapp

# Switch to new user
su - webapp
```

### Step 3.4: Check System Resources

```bash
# Check CPU
lscpu

# Check RAM
free -h

# Check disk space
df -h

# Check OS version
cat /etc/os-release
```

---

## 4. Install Software Dependencies {#install-dependencies}

### Step 4.1: Install Node.js 18

**Ubuntu/Debian:**
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version
```

**CentOS/RHEL:**
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs
```

### Step 4.2: Install Yarn

```bash
# Install Yarn globally
sudo npm install -g yarn

# Verify installation
yarn --version
```

### Step 4.3: Install Python 3.11

**Ubuntu/Debian:**
```bash
# Add deadsnakes PPA (for Ubuntu)
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update

# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Verify installation
python3.11 --version
```

**Alternative: Build from source (if not available in repos)**
```bash
sudo apt install -y build-essential libssl-dev zlib1g-dev \
  libncurses5-dev libncursesw5-dev libreadline-dev libsqlite3-dev \
  libgdbm-dev libdb5.3-dev libbz2-dev libexpat1-dev liblzma-dev tk-dev

cd /tmp
wget https://www.python.org/ftp/python/3.11.7/Python-3.11.7.tgz
tar -xzf Python-3.11.7.tgz
cd Python-3.11.7
./configure --enable-optimizations
make -j$(nproc)
sudo make altinstall
```

### Step 4.4: Install MongoDB

**Ubuntu/Debian:**
```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
sudo systemctl status mongod
mongosh --version
```

**CentOS/RHEL:**
```bash
# Create MongoDB repo file
cat <<EOF | sudo tee /etc/yum.repos.d/mongodb-org-6.0.repo
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/8/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF

# Install
sudo dnf install -y mongodb-org

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 4.5: Install Nginx

**Ubuntu/Debian:**
```bash
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
sudo systemctl status nginx
nginx -v
```

**CentOS/RHEL:**
```bash
sudo dnf install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 4.6: Install Supervisor

**Ubuntu/Debian:**
```bash
sudo apt install -y supervisor

# Start Supervisor
sudo systemctl start supervisor
sudo systemctl enable supervisor

# Verify
sudo systemctl status supervisor
```

**CentOS/RHEL:**
```bash
sudo dnf install -y supervisor
sudo systemctl start supervisord
sudo systemctl enable supervisord
```

### Step 4.7: Install Additional Tools

```bash
# Install certbot for SSL (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx

# Install htop for monitoring
sudo apt install -y htop

# Install ufw firewall
sudo apt install -y ufw
```

### Step 4.8: Verify All Installations

```bash
echo "=== Checking Installations ==="
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Yarn: $(yarn --version)"
echo "Python: $(python3.11 --version)"
echo "MongoDB: $(mongosh --version | head -1)"
echo "Nginx: $(nginx -v 2>&1)"
echo "Supervisor: $(supervisorctl --version)"
```

---

## 5. Download Assets {#download-assets}

### Step 5.1: Use Provided Download Script

**On your server:**
```bash
# Create assets directory
mkdir -p ~/website-deployment/assets

# Copy the download script from the deployment package
# (Upload it via scp or create it manually)

# Run the script
cd ~/website-deployment
bash download-assets.sh
```

**If script not available, manual download:**
```bash
mkdir -p ~/website-deployment/assets/{photos,pdfs}
cd ~/website-deployment/assets

# Download profile photo
wget -O photos/prince-photo.jpg \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/k1emhgqc_prince-photo.jpg"

# Download CV
wget -O pdfs/CV-Prince-Hamandawana.pdf \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/9rjns1an_CV%20Prince%20Hamandawana%20%281%29.pdf"

# ... continue for all 20 files (see download-assets.sh for complete list)
```

### Step 5.2: Verify Downloads

```bash
# Check file counts
echo "Photos: $(ls -1 ~/website-deployment/assets/photos | wc -l)"
echo "PDFs: $(ls -1 ~/website-deployment/assets/pdfs | wc -l)"

# Check total size
du -sh ~/website-deployment/assets
```

Expected output:
- Photos: 16 files
- PDFs: 2 files
- Diagrams: 1 file
- Total size: ~50-100 MB

---

## 6. Deploy Application {#deploy-application}

### Step 6.1: Transfer Application Files

**From your current server to local server:**

```bash
# On current server, create archive (if not already done)
cd /app
tar -czf ~/academic-website.tar.gz \
  --exclude='node_modules' \
  --exclude='__pycache__' \
  --exclude='.git' \
  --exclude='frontend/build' \
  --exclude='backend/venv' \
  frontend/ backend/

# From your local machine, download from current server
scp user@current-server:/home/user/academic-website.tar.gz ~/

# Upload to your local Linux server
scp ~/academic-website.tar.gz user@your-local-server:/home/user/
```

### Step 6.2: Extract and Organize Files

**On your local Linux server:**
```bash
# Create deployment directory
sudo mkdir -p /var/www/academic-website
sudo chown -R $USER:$USER /var/www/academic-website

# Extract application
cd /home/$USER
tar -xzf academic-website.tar.gz

# Move to deployment directory
mv frontend backend /var/www/academic-website/

# Copy assets
mkdir -p /var/www/academic-website/public/assets
cp -r ~/website-deployment/assets/* /var/www/academic-website/public/assets/

# Set permissions
sudo chown -R $USER:www-data /var/www/academic-website
sudo chmod -R 755 /var/www/academic-website
```

### Step 6.3: Setup Backend

```bash
cd /var/www/academic-website/backend

# Create Python virtual environment
python3.11 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Verify installation
pip list
```

### Step 6.4: Configure Backend Environment

```bash
# Create .env file
nano /var/www/academic-website/backend/.env
```

**Add this content:**
```bash
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=academic_website

# CORS Configuration
CORS_ORIGINS=*

# Optional: Add your Google Scholar ID
SCHOLAR_ID=adgtAm8AAAAJ
```

Save and exit (Ctrl+X, Y, Enter)

### Step 6.5: Test Backend

```bash
# Test if backend starts
cd /var/www/academic-website/backend
source venv/bin/activate
python -m uvicorn server:app --host 0.0.0.0 --port 8001

# In another terminal, test
curl http://localhost:8001/api/
# Should return: {"message":"Hello World"}

# Stop the test server (Ctrl+C in the first terminal)
```

### Step 6.6: Setup Frontend

```bash
cd /var/www/academic-website/frontend

# Install dependencies
yarn install

# This may take 5-10 minutes
```

### Step 6.7: Configure Frontend Environment

```bash
# Create .env file
nano /var/www/academic-website/frontend/.env
```

**Add this content:**
```bash
# Backend URL - use your server's IP or domain
REACT_APP_BACKEND_URL=http://YOUR_SERVER_IP

# Or if you have a domain:
# REACT_APP_BACKEND_URL=https://your-domain.com
```

Save and exit

### Step 6.8: Update Asset URLs

```bash
# Edit mockData.js
nano /var/www/academic-website/frontend/src/mockData.js
```

**Replace all asset URLs:**

Find and replace:
```javascript
// OLD
"https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/k1emhgqc_prince-photo.jpg"

// NEW
"/assets/photos/prince-photo.jpg"
```

Do this for all 20 assets (photos, PDFs, diagrams)

**Quick way using sed:**
```bash
cd /var/www/academic-website/frontend/src

# Backup first
cp mockData.js mockData.js.backup

# Replace profile photo
sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/k1emhgqc_prince-photo.jpg|/assets/photos/prince-photo.jpg|g' mockData.js

# Replace CV
sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/9rjns1an_CV%20Prince%20Hamandawana%20%281%29.pdf|/assets/pdfs/CV-Prince-Hamandawana.pdf|g' mockData.js

# ... continue for all assets (see MOCKDATA_URL_UPDATE_GUIDE.md for complete list)
```

### Step 6.9: Build Frontend

```bash
cd /var/www/academic-website/frontend

# Build production version
yarn build

# This creates /var/www/academic-website/frontend/build/
# Build may take 2-5 minutes
```

### Step 6.10: Verify Build

```bash
# Check build directory
ls -la /var/www/academic-website/frontend/build/

# Should contain:
# - index.html
# - static/
# - assets/
# - etc.
```

---

## 7. Configure Nginx {#configure-nginx}

### Step 7.1: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/academic-website
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;  # Or your domain name
    
    # Root directory for frontend
    root /var/www/academic-website/frontend/build;
    index index.html;

    # Serve static assets
    location /assets/ {
        alias /var/www/academic-website/public/assets/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri $uri/ =404;
    }

    # Serve frontend
    location / {
        try_files $uri $uri/ /index.html;
        
        # Enable gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
        gzip_min_length 256;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Disable caching for API
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts (important for Google Scholar requests)
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache static files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Logging
    access_log /var/log/nginx/academic-website-access.log;
    error_log /var/log/nginx/academic-website-error.log;
}
```

Save and exit

### Step 7.2: Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/academic-website /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Should show: "syntax is ok" and "test is successful"
```

### Step 7.3: Restart Nginx

```bash
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

---

## 8. Configure Supervisor {#configure-supervisor}

### Step 8.1: Create Supervisor Configuration

```bash
sudo nano /etc/supervisor/conf.d/academic-backend.conf
```

**Add this configuration:**
```ini
[program:academic-backend]
command=/var/www/academic-website/backend/venv/bin/python -m uvicorn server:app --host 0.0.0.0 --port 8001 --workers 2
directory=/var/www/academic-website/backend
user=YOUR_USERNAME
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/academic-backend.log
stderr_logfile=/var/log/academic-backend-error.log
environment=PATH="/var/www/academic-website/backend/venv/bin"
```

Replace `YOUR_USERNAME` with your actual username

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

### Step 8.3: Verify Backend is Running

```bash
# Check if backend is listening
sudo netstat -tlnp | grep 8001

# Test backend
curl http://localhost:8001/api/
# Should return: {"message":"Hello World"}

# Test Google Scholar integration
curl http://localhost:8001/api/publications/scholar/adgtAm8AAAAJ?max_publications=1
```

---

## 9. Test Deployment {#test-deployment}

### Step 9.1: Test from Local Server

```bash
# Test backend
curl http://localhost:8001/api/
curl http://localhost/api/  # Through Nginx

# Test frontend
curl http://localhost/ | grep -i "root"
```

### Step 9.2: Test from Browser

**On your local network:**
1. Find server's IP:
   ```bash
   ip addr show | grep inet
   # Or: hostname -I
   ```

2. Open browser on another device on same network
3. Go to: `http://SERVER_IP`
4. You should see your website!

### Step 9.3: Test All Features

Visit your website and check:
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Profile photo displays
- [ ] CV downloads
- [ ] Teaching section loads
- [ ] Publications load from Google Scholar
- [ ] Lab member photos display
- [ ] News section with diagrams
- [ ] All links work
- [ ] Mobile responsive

### Step 9.4: Check Logs

```bash
# Backend logs
sudo tail -f /var/log/academic-backend.log

# Nginx access logs
sudo tail -f /var/log/nginx/academic-website-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/academic-website-error.log
```

---

## 10. Setup Domain Name {#setup-domain-name}

### Option A: Dynamic DNS (If you don't have static IP)

**Using No-IP (free):**
1. Register at https://www.noip.com/
2. Create hostname (e.g., `princehamandawana.ddns.net`)
3. Install No-IP DUC on server:
   ```bash
   cd /tmp
   wget https://www.noip.com/client/linux/noip-duc-linux.tar.gz
   tar -xzf noip-duc-linux.tar.gz
   cd noip-2.1.9-1/
   sudo make install
   
   # Configure (enter your No-IP credentials)
   sudo /usr/local/bin/noip2 -C
   
   # Start service
   sudo /usr/local/bin/noip2
   ```

4. Update Nginx configuration with your hostname

**Using DuckDNS (free):**
1. Register at https://www.duckdns.org/
2. Create subdomain (e.g., `princehamandawana.duckdns.org`)
3. Install DuckDNS updater:
   ```bash
   mkdir ~/duckdns
   cd ~/duckdns
   nano duck.sh
   ```
   
   Add:
   ```bash
   echo url="https://www.duckdns.org/update?domains=YOUR_DOMAIN&token=YOUR_TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -
   ```
   
   Make executable and add to cron:
   ```bash
   chmod +x duck.sh
   crontab -e
   # Add: */5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1
   ```

### Option B: Custom Domain (If you own a domain)

1. **Point A record to your server:**
   - Go to your domain registrar (Namecheap, GoDaddy, etc.)
   - Add A record:
     - Type: A
     - Host: @ (or leave empty)
     - Value: YOUR_PUBLIC_IP
     - TTL: 3600

2. **Add www subdomain:**
   - Type: CNAME
   - Host: www
   - Value: your-domain.com
   - TTL: 3600

3. **Wait for DNS propagation** (1-24 hours)

4. **Update Nginx configuration:**
   ```bash
   sudo nano /etc/nginx/sites-available/academic-website
   ```
   
   Change:
   ```nginx
   server_name your-domain.com www.your-domain.com;
   ```

5. **Restart Nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Option C: Use Server IP (Simplest)

Just access your website via IP address:
```
http://YOUR_SERVER_IP
```

---

## 11. Enable SSL/HTTPS {#enable-ssl}

### Prerequisites

- Domain name pointing to your server (required for Let's Encrypt)
- Ports 80 and 443 open in firewall

### Step 11.1: Open Firewall Ports

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Step 11.2: Install Certbot

Already installed in Step 4.7, verify:
```bash
certbot --version
```

### Step 11.3: Obtain SSL Certificate

**Make sure your domain DNS is working first!**

```bash
# Stop Nginx temporarily (certbot needs port 80)
sudo systemctl stop nginx

# Obtain certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to share email

# Restart Nginx
sudo systemctl start nginx
```

### Step 11.4: Configure Nginx for HTTPS

```bash
sudo nano /etc/nginx/sites-available/academic-website
```

**Replace entire file with:**
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL parameters
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Root directory
    root /var/www/academic-website/frontend/build;
    index index.html;

    # Static assets
    location /assets/ {
        alias /var/www/academic-website/public/assets/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache static files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/academic-website-access.log;
    error_log /var/log/nginx/academic-website-error.log;
}
```

### Step 11.5: Test and Restart

```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 11.6: Setup Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# If successful, renewal is already configured
# Certificates auto-renew every 90 days
```

### Step 11.7: Verify HTTPS

Open browser:
```
https://your-domain.com
```

Check for:
- 🔒 Padlock icon in address bar
- Valid certificate
- No security warnings

---

## 12. Security Hardening {#security-hardening}

### Step 12.1: Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (important - don't lock yourself out!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny all other incoming traffic
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Check status
sudo ufw status verbose
```

### Step 12.2: Secure SSH

```bash
# Disable root login
sudo nano /etc/ssh/sshd_config

# Change these lines:
# PermitRootLogin no
# PasswordAuthentication no  # If using SSH keys
# Port 2222  # Optional: change default port

# Restart SSH
sudo systemctl restart sshd
```

### Step 12.3: Enable Automatic Security Updates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
# Select "Yes"
```

### Step 12.4: Install Fail2Ban

```bash
# Install
sudo apt install -y fail2ban

# Create local configuration
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit configuration
sudo nano /etc/fail2ban/jail.local

# Find [sshd] section and ensure:
# enabled = true
# maxretry = 3

# Start service
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status
```

### Step 12.5: Secure MongoDB

```bash
# Create MongoDB admin user
mongosh

# In MongoDB shell:
use admin
db.createUser({
  user: "admin",
  pwd: "STRONG_PASSWORD_HERE",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})

# Exit MongoDB shell
exit

# Enable authentication
sudo nano /etc/mongod.conf

# Add these lines:
security:
  authorization: enabled

# Restart MongoDB
sudo systemctl restart mongod

# Update backend .env with credentials
nano /var/www/academic-website/backend/.env

# Change MONGO_URL to:
# MONGO_URL=mongodb://admin:STRONG_PASSWORD_HERE@localhost:27017/?authSource=admin

# Restart backend
sudo supervisorctl restart academic-backend
```

### Step 12.6: Secure File Permissions

```bash
# Set proper ownership
sudo chown -R $USER:www-data /var/www/academic-website

# Set directory permissions
sudo find /var/www/academic-website -type d -exec chmod 755 {} \;

# Set file permissions
sudo find /var/www/academic-website -type f -exec chmod 644 {} \;

# Make backend executable
chmod +x /var/www/academic-website/backend/venv/bin/python

# Protect .env files
chmod 600 /var/www/academic-website/backend/.env
chmod 600 /var/www/academic-website/frontend/.env
```

---

## 13. Setup Backups {#setup-backups}

### Step 13.1: Create Backup Script

```bash
sudo nano /usr/local/bin/backup-academic-website.sh
```

**Add this script:**
```bash
#!/bin/bash

# Academic Website Backup Script
# Backs up application files and MongoDB database

# Configuration
BACKUP_DIR="/var/backups/academic-website"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
echo "Backing up MongoDB..."
mongodump --db academic_website --out $BACKUP_DIR/mongodb_$DATE

# Backup application files
echo "Backing up application files..."
tar -czf $BACKUP_DIR/app_$DATE.tar.gz \
  /var/www/academic-website/frontend/src/mockData.js \
  /var/www/academic-website/backend/.env \
  /var/www/academic-website/frontend/.env \
  /var/www/academic-website/public/assets

# Backup Nginx config
echo "Backing up configurations..."
cp /etc/nginx/sites-available/academic-website $BACKUP_DIR/nginx_$DATE.conf
cp /etc/supervisor/conf.d/academic-backend.conf $BACKUP_DIR/supervisor_$DATE.conf

# Remove old backups
echo "Cleaning old backups..."
find $BACKUP_DIR -name "mongodb_*" -mtime +$RETENTION_DAYS -exec rm -rf {} \;
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "nginx_*.conf" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "supervisor_*.conf" -mtime +$RETENTION_DAYS -delete

# Log backup
echo "Backup completed: $DATE" >> $BACKUP_DIR/backup.log

# Get backup size
BACKUP_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
echo "Total backup size: $BACKUP_SIZE"
```

### Step 13.2: Make Script Executable

```bash
sudo chmod +x /usr/local/bin/backup-academic-website.sh
```

### Step 13.3: Test Backup Script

```bash
sudo /usr/local/bin/backup-academic-website.sh
```

Check backups:
```bash
ls -lh /var/backups/academic-website/
```

### Step 13.4: Schedule Automatic Backups

```bash
# Edit root crontab
sudo crontab -e

# Add daily backup at 2 AM:
0 2 * * * /usr/local/bin/backup-academic-website.sh >> /var/log/academic-backup.log 2>&1

# Or weekly on Sundays at 3 AM:
0 3 * * 0 /usr/local/bin/backup-academic-website.sh >> /var/log/academic-backup.log 2>&1
```

### Step 13.5: Setup Remote Backup (Optional)

**Using rsync to remote server:**
```bash
# Add to backup script:
rsync -avz --delete /var/backups/academic-website/ user@backup-server:/backups/academic-website/
```

**Using cloud storage (AWS S3, Google Drive, Dropbox):**
```bash
# Install rclone
curl https://rclone.org/install.sh | sudo bash

# Configure rclone (follow prompts)
rclone config

# Add to backup script:
rclone sync /var/backups/academic-website/ remote:academic-website-backups
```

---

## 14. Monitoring {#monitoring}

### Step 14.1: Install Monitoring Tools

```bash
# Install htop (interactive process viewer)
sudo apt install -y htop

# Install netdata (real-time performance monitoring)
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Access at: http://YOUR_SERVER_IP:19999
```

### Step 14.2: Monitor Services

```bash
# Check all services
sudo systemctl status nginx
sudo systemctl status mongod
sudo supervisorctl status

# Monitor logs in real-time
sudo tail -f /var/log/academic-backend.log
sudo tail -f /var/log/nginx/academic-website-access.log
```

### Step 14.3: Monitor Disk Space

```bash
# Check disk usage
df -h

# Monitor specific directories
du -sh /var/www/academic-website
du -sh /var/backups/academic-website
du -sh /var/log
```

### Step 14.4: Monitor Memory and CPU

```bash
# Real-time monitoring
htop

# Memory usage
free -h

# CPU usage
top

# Load average
uptime
```

### Step 14.5: Setup Alerts (Optional)

**Email alerts for low disk space:**
```bash
# Create alert script
sudo nano /usr/local/bin/disk-alert.sh
```

```bash
#!/bin/bash
THRESHOLD=80
EMAIL="your-email@example.com"

USAGE=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')

if [ $USAGE -gt $THRESHOLD ]; then
    echo "Disk usage is at ${USAGE}% on $(hostname)" | mail -s "Disk Space Alert" $EMAIL
fi
```

```bash
sudo chmod +x /usr/local/bin/disk-alert.sh

# Add to crontab (check daily)
sudo crontab -e
0 9 * * * /usr/local/bin/disk-alert.sh
```

---

## 15. Maintenance {#maintenance}

### Daily Tasks

**Check service status:**
```bash
sudo systemctl status nginx mongod
sudo supervisorctl status
```

**Check logs for errors:**
```bash
sudo tail -50 /var/log/academic-backend.log | grep -i error
sudo tail -50 /var/log/nginx/academic-website-error.log
```

### Weekly Tasks

**Update system packages:**
```bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y
```

**Check disk space:**
```bash
df -h
du -sh /var/www/academic-website
du -sh /var/backups
```

**Verify backups:**
```bash
ls -lh /var/backups/academic-website/
```

### Monthly Tasks

**Update content:**
```bash
# Update mockData.js if needed
nano /var/www/academic-website/frontend/src/mockData.js

# Rebuild frontend
cd /var/www/academic-website/frontend
yarn build
```

**Clean old logs:**
```bash
sudo find /var/log -type f -name "*.log" -mtime +30 -delete
sudo journalctl --vacuum-time=30d
```

**Review security:**
```bash
# Check fail2ban bans
sudo fail2ban-client status sshd

# Check firewall rules
sudo ufw status verbose

# Check for security updates
sudo apt list --upgradable
```

### Quarterly Tasks

**Test backups:**
```bash
# Extract and verify a backup
cd /tmp
tar -xzf /var/backups/academic-website/app_YYYYMMDD_HHMMSS.tar.gz
```

**Review SSL certificate:**
```bash
sudo certbot certificates
```

**Update Node.js/Python if needed:**
```bash
# Check versions
node --version
python3.11 --version

# Update if necessary (carefully!)
```

### Updating Website Content

**For mockData.js changes:**
```bash
# Edit content
nano /var/www/academic-website/frontend/src/mockData.js

# Rebuild
cd /var/www/academic-website/frontend
yarn build

# No restart needed - Nginx serves new build automatically
```

**For backend code changes:**
```bash
# Edit files
nano /var/www/academic-website/backend/server.py

# Restart backend
sudo supervisorctl restart academic-backend
```

**For adding new assets (photos, PDFs):**
```bash
# Copy new files
cp new-photo.jpg /var/www/academic-website/public/assets/photos/

# Update mockData.js with new paths
nano /var/www/academic-website/frontend/src/mockData.js

# Rebuild frontend
cd /var/www/academic-website/frontend
yarn build
```

---

## Troubleshooting

See: `guides/04-troubleshooting.md`

---

## Next Steps

1. ✅ Your website is now deployed!
2. Test all functionality thoroughly
3. Set up monitoring and backups
4. Share your website URL
5. Keep content updated

---

## Support

- Community forums: Server Fault, Stack Overflow
- Linux documentation: man pages, Ubuntu help
- Project documentation: Check other guides in this folder

---

**Deployment Complete! 🎉**

Your academic website is now running on your local Linux server.

**Access your website at:**
- `http://YOUR_SERVER_IP`
- or `https://your-domain.com` (if configured)

---

**Guide Version:** 1.0
**Last Updated:** February 2026
**For:** Dr. Prince Hamandawana's Academic Website
