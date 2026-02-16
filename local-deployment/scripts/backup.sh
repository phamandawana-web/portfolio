#!/bin/bash

# Academic Website Backup Script
# Backs up application files and MongoDB database

# Configuration
BACKUP_DIR="/var/backups/academic-website"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Create backup directory
mkdir -p $BACKUP_DIR

echo "Starting backup: $DATE"

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

# Backup configurations
echo "Backing up configurations..."
cp /etc/nginx/sites-available/academic-website $BACKUP_DIR/nginx_$DATE.conf
cp /etc/supervisor/conf.d/academic-backend.conf $BACKUP_DIR/supervisor_$DATE.conf

# Remove old backups
echo "Cleaning old backups..."
find $BACKUP_DIR -name "mongodb_*" -mtime +$RETENTION_DAYS -exec rm -rf {} \;
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.conf" -mtime +$RETENTION_DAYS -delete

# Log completion
echo "Backup completed: $DATE" >> $BACKUP_DIR/backup.log

# Show backup size
BACKUP_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
echo "Total backup size: $BACKUP_SIZE"
echo "Backup completed successfully!"
