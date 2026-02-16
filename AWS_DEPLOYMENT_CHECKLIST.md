# AWS Deployment Quick Checklist

Use this checklist to track your progress during AWS deployment.

---

## Pre-Deployment

- [ ] AWS account created and verified
- [ ] Payment method added to AWS
- [ ] AWS CLI installed (optional)
- [ ] Application code packaged (tar.gz file)
- [ ] Assets downloaded from Emergent CDN
- [ ] Domain name registered (optional but recommended)

---

## S3 Asset Storage

- [ ] S3 bucket created: `academic-website-assets-[unique-name]`
- [ ] Bucket configured for public access
- [ ] Bucket policy added for public read
- [ ] All assets uploaded (17 photos + 2 PDFs + 1 diagram)
- [ ] Asset URLs documented
- [ ] Test: Can access photos via S3 URL

---

## EC2 Instance Setup

- [ ] EC2 instance launched (Ubuntu 22.04)
- [ ] Instance type selected (t3.small recommended)
- [ ] Storage configured (20-30 GB)
- [ ] Security group created with ports: 22, 80, 443
- [ ] Key pair downloaded and secured (.pem file)
- [ ] Elastic IP allocated (optional but recommended)
- [ ] Connected to instance via SSH

---

## Server Software Installation

- [ ] System updated: `sudo apt update && sudo apt upgrade -y`
- [ ] Node.js 18 installed
- [ ] Yarn installed
- [ ] Python 3.11 installed
- [ ] MongoDB installed and running
- [ ] Nginx installed
- [ ] Supervisor installed
- [ ] Git and utilities installed

---

## Application Deployment

- [ ] Application files transferred to EC2
- [ ] Files extracted to `/var/www/academic-website/`
- [ ] Backend virtual environment created
- [ ] Backend dependencies installed: `pip install -r requirements.txt`
- [ ] Backend `.env` file created with MongoDB config
- [ ] Frontend dependencies installed: `yarn install`
- [ ] Frontend `.env` file updated with backend URL
- [ ] mockData.js updated with S3 asset URLs
- [ ] Frontend built: `yarn build`

---

## Nginx Configuration

- [ ] Nginx configuration file created
- [ ] Frontend build path configured
- [ ] Backend API proxy configured
- [ ] Security headers added
- [ ] Configuration tested: `sudo nginx -t`
- [ ] Site enabled (symlink created)
- [ ] Default site disabled
- [ ] Nginx restarted

---

## Backend Service (Supervisor)

- [ ] Supervisor configuration created
- [ ] Configuration reloaded: `sudo supervisorctl reread`
- [ ] Configuration updated: `sudo supervisorctl update`
- [ ] Backend service started
- [ ] Service status verified: Running

---

## Testing

- [ ] Backend API test: `curl http://localhost:8001/api/`
- [ ] Google Scholar test: Publications fetching
- [ ] Frontend accessible via browser: `http://YOUR_IP`
- [ ] Navigation working
- [ ] Photos loading from S3
- [ ] PDFs downloading correctly
- [ ] All links functional
- [ ] Mobile responsive test

---

## Domain Configuration (Optional)

- [ ] Domain registered
- [ ] DNS A record created pointing to EC2 IP
- [ ] DNS CNAME record for www subdomain
- [ ] Nginx server_name updated with domain
- [ ] Frontend .env updated with domain URL
- [ ] Frontend rebuilt
- [ ] Domain accessible (wait for DNS propagation)

---

## SSL/HTTPS Setup

- [ ] Certbot installed
- [ ] SSL certificate obtained: `sudo certbot --nginx -d domain.com`
- [ ] Certificate auto-renewal tested
- [ ] HTTPS accessible: `https://your-domain.com`
- [ ] HTTP to HTTPS redirect working
- [ ] Padlock icon visible in browser

---

## Security & Optimization

- [ ] UFW firewall enabled
- [ ] Firewall rules configured (ports 22, 80, 443)
- [ ] Automatic security updates enabled
- [ ] Backup script created
- [ ] Cron job scheduled for backups
- [ ] Nginx caching enabled for static files
- [ ] Gzip compression enabled

---

## Monitoring & Maintenance

- [ ] Log files location documented
- [ ] CloudWatch agent installed (optional)
- [ ] Monitoring dashboard configured (optional)
- [ ] Alert notifications set up (optional)
- [ ] Backup restoration tested
- [ ] Maintenance schedule documented

---

## Post-Deployment Verification

- [ ] All pages load correctly
- [ ] Google Scholar sync working
- [ ] Publications display with filters
- [ ] News section with diagrams visible
- [ ] Lab members photos display
- [ ] Contact form/links working
- [ ] CV and teaching philosophy downloadable
- [ ] Mobile responsive on different devices
- [ ] Page load time acceptable (< 3 seconds)
- [ ] No console errors in browser

---

## Documentation

- [ ] Server IP address documented
- [ ] Domain name documented
- [ ] AWS account details saved
- [ ] S3 bucket name saved
- [ ] SSH key pair location noted
- [ ] Database credentials saved (encrypted)
- [ ] Admin email/credentials saved
- [ ] Maintenance procedures documented

---

## Cost Management

- [ ] Billing alerts set up in AWS
- [ ] Monthly cost estimate calculated
- [ ] Auto-scaling configured (if needed)
- [ ] Unused resources terminated
- [ ] Cost optimization review scheduled

---

## Launch Checklist

Before announcing your website:

- [ ] All content reviewed and accurate
- [ ] Typos and errors corrected
- [ ] Contact information verified
- [ ] Social media links updated
- [ ] Google Scholar sync verified
- [ ] Test from multiple devices/browsers
- [ ] Test from different locations
- [ ] Backup completed
- [ ] Performance optimized
- [ ] Security best practices applied

---

## Success Criteria

Your deployment is successful when:

✅ Website loads at your domain with HTTPS
✅ All images display from S3
✅ PDFs download correctly
✅ Google Scholar publications sync
✅ Navigation and links work
✅ Mobile responsive
✅ Page load time < 3 seconds
✅ No console errors
✅ Backend API responding
✅ Database connected
✅ Backups running automatically
✅ SSL certificate valid
✅ Monitoring in place

---

## Emergency Contacts

- AWS Support: https://console.aws.amazon.com/support/
- AWS Forums: https://forums.aws.amazon.com/
- Stack Overflow: https://stackoverflow.com/questions/tagged/amazon-web-services

---

## Estimated Timeline

- **Part 1-2 (Prep & Assets):** 30 minutes
- **Part 3 (S3 Setup):** 20 minutes
- **Part 4-5 (EC2 Setup):** 40 minutes
- **Part 6-8 (Deployment):** 45 minutes
- **Part 9 (Testing):** 15 minutes
- **Part 10-11 (Domain & SSL):** 30 minutes
- **Part 12 (Security):** 20 minutes
- **Total:** ~3 hours (plus DNS propagation time)

---

## Common Issues & Solutions

### Issue: Can't SSH into EC2
- Check security group allows port 22 from your IP
- Verify key file permissions: `chmod 400 key.pem`
- Check instance is running

### Issue: Website shows 502 Bad Gateway
- Backend not running: `sudo supervisorctl status`
- Check backend logs: `sudo tail /var/log/academic-backend.err.log`

### Issue: Images not loading
- Verify S3 bucket is public
- Check S3 URLs in mockData.js
- Test S3 URL directly in browser

### Issue: SSL certificate fails
- Verify domain points to EC2 IP
- Wait for DNS propagation (up to 24 hours)
- Check port 80 is open in security group

---

**Print this checklist and check off items as you complete them!**
