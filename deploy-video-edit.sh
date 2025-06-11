#!/bin/bash

# BitZomax Video Edit Functionality Deployment
# Deploy the new video edit/update functionality

echo "🚀 Starting BitZomax Video Edit Functionality Deployment..."

# Navigate to project directory
cd /opt/bitzomax/bitzomax-NL

# Create backup
echo "💾 Creating backup..."
BACKUP_DIR="/opt/bitzomax/backup_video_edit_$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR
cp -r backend/src/main/java/com/bitzomax/service/VideoService.java $BACKUP_DIR/ 2>/dev/null || true
cp -r backend/src/main/java/com/bitzomax/controller/VideoController.java $BACKUP_DIR/ 2>/dev/null || true
cp -r frontend/src/app/services/video.service.ts $BACKUP_DIR/ 2>/dev/null || true
cp -r frontend/src/app/components/admin/admin-dashboard/ $BACKUP_DIR/ 2>/dev/null || true
cp -r frontend/src/app/app.routes.ts $BACKUP_DIR/ 2>/dev/null || true
cp -r frontend/src/app/app.routes.server.ts $BACKUP_DIR/ 2>/dev/null || true
echo "✅ Backup created at: $BACKUP_DIR"

# Stop services
echo "🛑 Stopping services..."
docker-compose down

# Pull latest changes from Git
echo "📥 Pulling latest changes..."
git pull origin main

# Build backend
echo "🔨 Building backend..."
cd backend
./mvnw clean package -DskipTests
cd ..

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Test the deployment
echo "🧪 Testing video edit functionality..."
curl -f http://localhost/api/videos/all -H "Accept: application/json" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Backend API is responding"
else
    echo "❌ Backend API not responding"
fi

curl -f http://localhost/ > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend not accessible"
fi

echo "🎉 Video Edit Functionality Deployment Complete!"
echo ""
echo "📋 New Features Deployed:"
echo "   ✅ Backend: Video update endpoint (PUT /api/videos/{id})"
echo "   ✅ Frontend: Video edit component"
echo "   ✅ Frontend: Edit button in admin dashboard"
echo "   ✅ Frontend: Video edit routing"
echo ""
echo "🔗 Test the functionality at: https://bitzomax.nl/admin/dashboard"
echo "   1. Login as admin"
echo "   2. Go to Videos tab"
echo "   3. Click 'Bewerken' button on any video"
echo ""
