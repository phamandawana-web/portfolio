# Local Linux Server Deployment Package

## 📁 Contents

This folder contains everything you need to deploy your academic website on your own Linux server.

---

## 📚 Documentation Files

### Main Guides (in `/guides/`)
1. **01-deployment-guide.md** - Complete step-by-step deployment instructions
2. **02-quick-start.md** - Fast deployment guide for experienced users
3. **03-configuration-reference.md** - All configuration details
4. **04-troubleshooting.md** - Common issues and solutions
5. **05-maintenance-guide.md** - Ongoing maintenance procedures
6. **06-security-hardening.md** - Security best practices

### Scripts (in `/scripts/`)
1. **download-assets.sh** - Download all photos and PDFs from Emergent
2. **install-dependencies.sh** - Install all required software
3. **deploy-application.sh** - Deploy the application
4. **setup-nginx.sh** - Configure Nginx
5. **setup-supervisor.sh** - Configure Supervisor
6. **backup.sh** - Backup script
7. **update-content.sh** - Update website content

### Configuration Files (in `/configs/`)
1. **nginx.conf** - Nginx configuration template
2. **supervisor.conf** - Supervisor configuration template
3. **backend.env.example** - Backend environment variables
4. **frontend.env.example** - Frontend environment variables

### Examples (in `/examples/`)
1. **systemd-service.example** - Alternative to Supervisor
2. **apache.conf.example** - Apache configuration (alternative to Nginx)
3. **docker-compose.yml** - Docker deployment option

---

## 🚀 Quick Start

1. Read: `guides/01-deployment-guide.md`
2. Run: `scripts/install-dependencies.sh`
3. Run: `scripts/download-assets.sh`
4. Run: `scripts/deploy-application.sh`
5. Configure: Use templates in `configs/`
6. Test: Access http://your-server-ip

---

## 📋 Requirements

- **OS:** Ubuntu 20.04+ / Debian 11+ / CentOS 8+ / RHEL 8+
- **RAM:** 2 GB minimum (4 GB recommended)
- **Storage:** 20 GB minimum
- **Network:** Internet connection for initial setup
- **Access:** Root or sudo privileges

---

## 💰 Cost

**Total Cost:** $0 (using your own server)

Hardware options:
- Use existing server
- Raspberry Pi 4 (4GB+ RAM): ~$75
- Refurbished PC: ~$100-200
- VPS from Hetzner/DigitalOcean: ~$5-10/month

---

## 🎯 What Gets Deployed

- **Frontend:** React production build served by Nginx
- **Backend:** FastAPI application managed by Supervisor
- **Database:** MongoDB for application data
- **Assets:** Photos and PDFs hosted locally
- **SSL:** Free Let's Encrypt certificate (optional)

---

## 🔧 Architecture

```
┌─────────────────────────────────────────┐
│           Your Linux Server              │
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────┐         ┌──────────┐     │
│  │  Nginx   │────────▶│ Frontend │     │
│  │  (Port   │         │  React   │     │
│  │   80/    │         │  Build   │     │
│  │   443)   │         └──────────┘     │
│  └────┬─────┘                           │
│       │                                  │
│       │ /api/*                           │
│       ▼                                  │
│  ┌──────────┐         ┌──────────┐     │
│  │ Backend  │────────▶│ MongoDB  │     │
│  │ FastAPI  │         │ Database │     │
│  │ (Port    │         │          │     │
│  │  8001)   │         └──────────┘     │
│  └──────────┘                           │
│       ▲                                  │
│       │                                  │
│  ┌────┴─────┐                           │
│  │Supervisor│                           │
│  │ Process  │                           │
│  │ Manager  │                           │
│  └──────────┘                           │
│                                          │
│  /var/www/academic-website/             │
│  ├── frontend/build/                    │
│  ├── backend/                           │
│  └── assets/                            │
│      ├── photos/                        │
│      └── pdfs/                          │
│                                          │
└─────────────────────────────────────────┘
```

---

## 📊 Comparison: Local vs AWS

| Feature | Local Server | AWS |
|---------|-------------|-----|
| Monthly Cost | $0 (electricity ~$5) | $20-50 |
| Setup Time | 2-3 hours | 2-3 hours |
| Scalability | Limited by hardware | Infinite |
| Maintenance | You manage | Partially managed |
| Uptime SLA | No guarantee | 99.9% |
| Backup | Manual | Automated options |
| Learning Curve | Moderate | Moderate-High |
| Full Control | ✅ Yes | ⚠️ Limited |

---

## 🎓 Learning Outcomes

By deploying locally, you'll learn:
- Linux server administration
- Web server configuration (Nginx)
- Process management (Supervisor)
- Database management (MongoDB)
- SSL certificate setup
- Security hardening
- Network configuration
- Application deployment

---

## 📞 Support

- Check troubleshooting guide: `guides/04-troubleshooting.md`
- Review logs: `sudo tail -f /var/log/...`
- Community forums: Stack Overflow, Server Fault
- Documentation: Links provided in each guide

---

## 🔄 Updates

To update documentation:
```bash
cd /app/local-deployment
git pull  # If using git
# Or download latest version
```

---

## 📄 License

This deployment package is provided as-is for your use.

---

## ✅ Ready to Deploy?

Start with: **`guides/01-deployment-guide.md`**

Follow the step-by-step instructions and you'll have your website running in 2-3 hours!

---

**Created:** February 2026
**Version:** 1.0
**For:** Dr. Prince Hamandawana's Academic Website
