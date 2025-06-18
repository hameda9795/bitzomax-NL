#!/bin/bash

# Bitzomax SEO Optimization Deployment Script
echo "🚀 Starting Bitzomax SEO Optimization Deployment..."

SERVER_IP="91.99.49.208"
SERVER_USER="root"

# Deploy to server
echo "🚀 Deploying SEO optimizations to server..."

ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
# Navigate to project directory
cd /root/bitzomax

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin master

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images to ensure clean rebuild
echo "🧹 Cleaning up old images..."
docker image prune -f

# Rebuild and start containers with no cache
echo "🔨 Rebuilding containers with SEO optimizations..."
docker-compose build --no-cache
docker-compose up -d

# Wait for containers to start
echo "⏳ Waiting for containers to start..."
sleep 30

# Check container status
echo "📊 Container Status:"
docker-compose ps

echo "✅ SEO optimization deployment completed!"
echo ""
echo "🎯 SEO Features Deployed:"
echo "  ✅ Enhanced Dutch keyword optimization"
echo "  ✅ Google Analytics 4 with video tracking"
echo "  ✅ Comprehensive structured data for rich results"
echo "  ✅ Advanced sitemap with video markup"
echo "  ✅ Optimized meta tags and Open Graph data"
echo "  ✅ Search engine verification setup"
echo ""
echo "🌐 Access your optimized site:"
echo "  Frontend: http://91.99.49.208:8000"
echo "  Frontend (HTTPS): https://91.99.49.208:8443"
echo "  Backend API: http://91.99.49.208:8082"
echo ""
echo "🔍 SEO Testing URLs:"
echo "  Sitemap: http://91.99.49.208:8000/sitemap.xml"
echo "  Robots.txt: http://91.99.49.208:8000/robots.txt"
EOF

echo "✅ SEO optimization deployment completed successfully!"
echo ""
echo "🎉 Your Bitzomax platform is now optimized for Dutch search engines!"
echo ""
echo "📊 Next steps to complete SEO setup:"
echo "1. Replace 'YOUR_GOOGLE_VERIFICATION_CODE' with actual Google Search Console code"
echo "2. Replace 'G-XXXXXXXXXX' with actual Google Analytics measurement ID"
echo "3. Submit sitemap to Google Search Console"
echo "4. Test with Google Rich Results Test"
echo ""
echo "🌐 Your SEO-optimized site: http://91.99.49.208:8000"
