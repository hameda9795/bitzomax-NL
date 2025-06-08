#!/bin/bash

# Script to deploy updated frontend files on the server

# Make backup of current frontend files
echo "Backing up current frontend files..."
cd /opt/bitzomax-git/frontend/dist/frontend/browser
BACKUP_DIR="/opt/bitzomax-backups/frontend-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR
cp -r * $BACKUP_DIR/

# Extract the new frontend files
echo "Extracting new frontend files..."
# Assuming the frontend-dist.zip is uploaded to /tmp
unzip -o /tmp/frontend-dist.zip -d /opt/bitzomax-git/frontend/dist/frontend/browser

# Make sure Nginx can access these files
echo "Setting permissions..."
chmod -R 755 /opt/bitzomax-git/frontend/dist/frontend/browser
chown -R nginx:nginx /opt/bitzomax-git/frontend/dist/frontend/browser

# Test Nginx configuration
echo "Testing Nginx configuration..."
nginx -t

# If Nginx config test was successful, reload Nginx
if [ $? -eq 0 ]; then
    echo "Reloading Nginx..."
    systemctl reload nginx
    echo "Deployment complete!"
else
    echo "Nginx configuration test failed. Please check the configuration."
fi
