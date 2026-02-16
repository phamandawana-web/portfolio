# Local Linux Server Deployment - Quick Checklist

## Pre-Deployment

- [ ] Linux server ready (Ubuntu 20.04+ / Debian 11+ / CentOS 8+)
- [ ] 2+ GB RAM, 20+ GB storage
- [ ] Root/sudo access
- [ ] Internet connection
- [ ] Application archive downloaded
- [ ] Assets downloaded from Emergent

## Installation

- [ ] System updated: `sudo apt update && sudo apt upgrade -y`
- [ ] Node.js 18 installed
- [ ] Yarn installed
- [ ] Python 3.11 installed
- [ ] MongoDB installed and running
- [ ] Nginx installed
- [ ] Supervisor installed
- [ ] Certbot installed (for SSL)

## Deployment

- [ ] Application files copied to `/var/www/academic-website/`
- [ ] Assets copied to `/var/www/academic-website/public/assets/`
- [ ] Backend virtual environment created
- [ ] Backend dependencies installed: `pip install -r requirements.txt`
- [ ] Backend `.env` file created
- [ ] Frontend dependencies installed: `yarn install`
- [ ] Frontend `.env` file created
- [ ] Asset URLs updated in mockData.js
- [ ] Frontend built: `yarn build`

## Configuration

- [ ] Nginx configuration created from template
- [ ] Nginx site enabled
- [ ] Nginx tested: `sudo nginx -t`
- [ ] Nginx restarted
- [ ] Supervisor configuration created
- [ ] Backend service started
- [ ] Backend running: `sudo supervisorctl status`

## Testing

- [ ] Backend API responds: `curl http://localhost:8001/api/`
- [ ] Google Scholar works
- [ ] Frontend loads in browser
- [ ] Navigation works
- [ ] Photos display from local assets
- [ ] PDFs download correctly
- [ ] All links functional
- [ ] Mobile responsive

## Domain & SSL (Optional)

- [ ] Domain DNS configured (or Dynamic DNS)
- [ ] Nginx server_name updated
- [ ] Ports 80, 443 open in firewall
- [ ] SSL certificate obtained: `sudo certbot --nginx`
- [ ] HTTPS working
- [ ] Certificate auto-renewal configured

## Security

- [ ] UFW firewall enabled
- [ ] SSH secured (key-based auth, non-standard port)
- [ ] Fail2Ban installed and configured
- [ ] MongoDB authentication enabled
- [ ] File permissions set correctly
- [ ] Automatic security updates enabled

## Backups

- [ ] Backup script created
- [ ] Backup script tested
- [ ] Cron job scheduled for automatic backups
- [ ] Remote backup configured (optional)

## Monitoring

- [ ] Htop installed
- [ ] Netdata installed (optional)
- [ ] Log monitoring configured
- [ ] Disk space alerts set up (optional)

## Final Verification

- [ ] All pages load correctly
- [ ] Google Scholar sync working
- [ ] Publications display with filters
- [ ] News section with diagrams
- [ ] Lab members photos display
- [ ] Contact links working
- [ ] Performance acceptable
- [ ] No errors in logs

## Documentation

- [ ] Server IP/domain documented
- [ ] Admin credentials saved securely
- [ ] Backup procedures documented
- [ ] Maintenance schedule created

---

## Success! Your Website is Live

**Access at:**
- Local: `http://YOUR_SERVER_IP`
- Domain: `https://your-domain.com` (if configured)

---

**Estimated Time:**
- Installation: 30-45 minutes
- Deployment: 30-45 minutes
- Configuration: 30 minutes
- Testing: 15 minutes
- Security & Backups: 30 minutes
- **Total: 2-3 hours**

---

**Monthly Cost:** $0 (using your own server)
- Electricity: ~$5/month
- Domain (optional): ~$10-15/year

---

**Print this checklist and check off items as you complete them!**
