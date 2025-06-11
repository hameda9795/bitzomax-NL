#!/bin/bash

echo "🚀 Starting production deployment for file serving fix..."

# Pull latest changes
echo "📥 Pulling latest changes from repository..."
git pull

# Stop all containers
echo "🛑 Stopping all containers..."
docker-compose down

# Remove old images to force rebuild
echo "🗑️ Removing old Docker images..."
docker rmi bitzomax-frontend bitzomax-backend 2>/dev/null || true

# Rebuild and start containers
echo "🔨 Rebuilding and starting containers..."
docker-compose up -d --build

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check container status
echo "📊 Checking container status..."
docker-compose ps

# Test if uploads are accessible
echo "🧪 Testing uploads accessibility..."
echo "Testing video endpoint..."
curl -I http://localhost:8082/uploads/videos/ 2>/dev/null || echo "Video endpoint not accessible"

echo "Testing cover endpoint..."
curl -I http://localhost:8082/uploads/covers/ 2>/dev/null || echo "Cover endpoint not accessible"

echo "✅ Deployment completed!"
echo "🌐 Please check https://bitzomax.nl to verify file display is working"
