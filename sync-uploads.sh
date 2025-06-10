#!/bin/bash

# BitZomax Upload Sync Script
# This script syncs uploaded files from Docker volume to host directory
# to ensure they are accessible via the API endpoints

echo "🔄 Syncing uploaded files from Docker volume to host directory..."

# Copy files from Docker volume to host directory
cp -r /var/lib/docker/volumes/bitzomax-nl_uploads_data/_data/* /opt/bitzomax/bitzomax-NL/backend/uploads/

# Set proper permissions
chown -R root:root /opt/bitzomax/bitzomax-NL/backend/uploads/
chmod -R 755 /opt/bitzomax/bitzomax-NL/backend/uploads/

echo "✅ File sync completed!"

# Show stats
echo "📊 Upload directory stats:"
echo "Videos: $(ls -1 /opt/bitzomax/bitzomax-NL/backend/uploads/videos/ 2>/dev/null | wc -l)"
echo "Covers: $(ls -1 /opt/bitzomax/bitzomax-NL/backend/uploads/covers/ 2>/dev/null | wc -l)"
