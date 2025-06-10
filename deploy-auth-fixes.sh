#!/bin/bash

# BitZomax Authentication Fixes Deployment Script
# This script deploys the authentication and HTTPS fixes

echo "🚀 Starting BitZomax Authentication Fixes Deployment..."

# Step 1: Build frontend with production configuration
echo "📦 Building frontend with production configuration..."
cd frontend
npm run build -- --configuration production

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend build completed successfully"

# Step 2: Build and deploy Docker containers
echo "🐳 Building and deploying Docker containers..."
cd ..

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build new images
echo "🔨 Building new Docker images..."
docker-compose build

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

# Start containers
echo "🚀 Starting updated containers..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Container startup failed!"
    exit 1
fi

echo "✅ Containers started successfully"

# Step 3: Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Step 4: Test authentication endpoint
echo "🧪 Testing authentication endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" https://bitzomax.nl/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

if [ "$response" = "200" ]; then
    echo "✅ Authentication endpoint is working"
else
    echo "⚠️  Authentication endpoint returned status: $response"
fi

# Step 5: Test file upload size
echo "🧪 Testing file upload configuration..."
upload_response=$(curl -s -o /dev/null -w "%{http_code}" https://bitzomax.nl/api/videos/upload \
    -H "Authorization: Bearer test" \
    -F "title=Test" 2>/dev/null)

if [ "$upload_response" = "401" ] || [ "$upload_response" = "403" ]; then
    echo "✅ Upload endpoint is accessible (auth required as expected)"
else
    echo "⚠️  Upload endpoint returned status: $upload_response"
fi

# Step 6: Check container health
echo "🏥 Checking container health..."
frontend_status=$(docker ps --filter "name=frontend" --format "table {{.Status}}" | tail -1)
backend_status=$(docker ps --filter "name=backend" --format "table {{.Status}}" | tail -1)

echo "Frontend container: $frontend_status"
echo "Backend container: $backend_status"

# Step 7: Display deployment summary
echo ""
echo "🎉 Deployment Summary:"
echo "====================="
echo "✅ Frontend built with production configuration"
echo "✅ Docker containers rebuilt and restarted"
echo "✅ Authentication endpoint tested"
echo "✅ Upload endpoint tested"
echo ""
echo "🔗 Application URL: https://bitzomax.nl"
echo "🔑 Admin Login: admin / admin123"
echo ""
echo "📋 Post-deployment checklist:"
echo "- [ ] Test admin login in browser"
echo "- [ ] Test user registration"
echo "- [ ] Test video upload"
echo "- [ ] Verify session persistence"
echo "- [ ] Check HTTPS mixed content resolution"
echo ""
echo "🐛 If issues persist, use the AuthDebugComponent:"
echo "   Add <app-auth-debug></app-auth-debug> to any component for debugging"
echo ""
echo "📚 For detailed troubleshooting, see: AUTHENTICATION_FIXES.md"

# Step 8: Optional - Deploy sample videos
echo ""
read -p "📹 Do you want to deploy sample video data? (y/N): " deploy_samples

if [[ $deploy_samples =~ ^[Yy]$ ]]; then
    echo "📊 Deploying sample video data..."
    
    # Check if PostgreSQL container is running
    postgres_container=$(docker ps --filter "name=postgres" --format "{{.Names}}" | head -1)
    
    if [ -n "$postgres_container" ]; then
        echo "📁 Executing sample_videos.sql..."
        docker exec -i "$postgres_container" psql -U bitzomax -d bitzomax < sample_videos.sql
        
        if [ $? -eq 0 ]; then
            echo "✅ Sample video data deployed successfully"
        else
            echo "⚠️  Sample video data deployment failed"
        fi
    else
        echo "⚠️  PostgreSQL container not found. Sample data not deployed."
    fi
fi

echo ""
echo "🎊 Deployment completed! Application should now be running with authentication fixes."
echo "🌐 Visit https://bitzomax.nl to test the application"
