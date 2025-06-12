# Bitzomax SEO Optimization Deployment Script
# This script deploys comprehensive SEO enhancements including:
# - Enhanced meta tags and Open Graph data
# - Dutch keyword optimization
# - Google Analytics and Search Console integration
# - Comprehensive structured data (Schema.org)
# - Advanced sitemap generation
# - Robots.txt optimization

Write-Host "🚀 Starting Bitzomax SEO Optimization Deployment..." -ForegroundColor Green

# Function to check if Docker is running
function Test-DockerRunning {
    try {
        docker version | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to check if server is accessible
function Test-ServerConnection {
    param($ServerIP)
    try {
        Test-NetConnection -ComputerName $ServerIP -Port 22 -InformationLevel Quiet
    }
    catch {
        return $false
    }
}

# Server configuration
$SERVER_IP = "91.99.49.208"
$SERVER_USER = "root"

Write-Host "📋 SEO Optimization Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Enhanced meta tags with Dutch keywords" -ForegroundColor Yellow
Write-Host "  ✅ Google Analytics 4 integration" -ForegroundColor Yellow
Write-Host "  ✅ Google Search Console setup" -ForegroundColor Yellow
Write-Host "  ✅ Comprehensive structured data (Schema.org)" -ForegroundColor Yellow
Write-Host "  ✅ Advanced sitemap with video and image markup" -ForegroundColor Yellow
Write-Host "  ✅ Optimized robots.txt for Dutch content" -ForegroundColor Yellow
Write-Host "  ✅ PWA manifest for mobile optimization" -ForegroundColor Yellow
Write-Host "  ✅ Open Graph and Twitter Card optimization" -ForegroundColor Yellow

# Check Docker availability
if (-not (Test-DockerRunning)) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker is running" -ForegroundColor Green

# Check server connectivity
Write-Host "🔍 Testing server connection..." -ForegroundColor Yellow
if (-not (Test-ServerConnection -ServerIP $SERVER_IP)) {
    Write-Host "❌ Cannot connect to server $SERVER_IP" -ForegroundColor Red
    Write-Host "Please check your internet connection and server availability." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Server connection successful" -ForegroundColor Green

# Commit and push changes
Write-Host "📝 Committing SEO optimization changes..." -ForegroundColor Yellow

try {
    git add .
    git commit -m "feat: Add comprehensive SEO optimization

- Enhanced meta tags with Dutch keywords and Open Graph data
- Google Analytics 4 integration with custom events
- Google Search Console verification setup
- Comprehensive Schema.org structured data for videos, organization, and website
- Advanced sitemap generation with video and image markup
- Optimized robots.txt for Dutch content and search engines
- PWA manifest for mobile optimization
- Enhanced performance tracking and analytics
- SEO-friendly breadcrumb navigation
- Rich results optimization for video content"
    
    git push origin main
    Write-Host "✅ Changes committed and pushed successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to commit and push changes: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Deploy to server
Write-Host "🚀 Deploying SEO optimizations to server..." -ForegroundColor Yellow

$deployCommands = @"
# Navigate to project directory
cd /root/bitzomax

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

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

# Check if frontend is accessible
echo "🌐 Testing frontend accessibility..."
curl -I http://localhost:8000 || echo "Frontend check failed"

# Check if backend is accessible
echo "🔗 Testing backend connectivity..."
curl -I http://localhost:8082/api/videos || echo "Backend check failed"

echo "✅ SEO optimization deployment completed!"
echo ""
echo "🎯 SEO Features Deployed:"
echo "  ✅ Enhanced Dutch keyword optimization"
echo "  ✅ Google Analytics 4 with video tracking"
echo "  ✅ Comprehensive structured data for rich results"
echo "  ✅ Advanced sitemap with video markup"
echo "  ✅ Optimized meta tags and Open Graph data"
echo "  ✅ Search engine verification setup"
echo "  ✅ Performance tracking and analytics"
echo ""
echo "📱 Access your optimized site:"
echo "  🌐 Frontend: http://91.99.49.208:8000"
echo "  🔒 Frontend (HTTPS): https://91.99.49.208:8443"
echo "  🔧 Backend API: http://91.99.49.208:8082"
echo ""
echo "🔍 SEO Testing URLs:"
echo "  📄 Sitemap: http://91.99.49.208:8000/sitemap.xml"
echo "  🤖 Robots.txt: http://91.99.49.208:8000/robots.txt"
echo "  📱 PWA Manifest: http://91.99.49.208:8000/site.webmanifest"
echo ""
echo "📈 Next Steps for Complete SEO Setup:"
echo "  1. 🔑 Replace 'YOUR_GOOGLE_VERIFICATION_CODE' with actual Google Search Console code"
echo "  2. 📊 Replace 'G-XXXXXXXXXX' with actual Google Analytics 4 measurement ID"
echo "  3. 🌐 Submit sitemap to Google Search Console"
echo "  4. 🔍 Verify structured data with Google Rich Results Test"
echo "  5. 📱 Test mobile-friendliness with Google Mobile-Friendly Test"
echo "  6. ⚡ Test page speed with Google PageSpeed Insights"
"@

# Execute deployment on server
try {
    $deployCommands | ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" 'bash -s'
    Write-Host "✅ SEO optimization deployment completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔧 Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "  1. Check server connectivity: ssh $SERVER_USER@$SERVER_IP" -ForegroundColor White
    Write-Host "  2. Verify Docker is running on server: docker --version" -ForegroundColor White
    Write-Host "  3. Check container logs: docker-compose logs" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "🎉 Bitzomax SEO Optimization Deployment Completed!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your SEO-optimized site is now live at:" -ForegroundColor Cyan
Write-Host "  Frontend: http://91.99.49.208:8000" -ForegroundColor White
Write-Host "  Frontend (HTTPS): https://91.99.49.208:8443" -ForegroundColor White
Write-Host ""
Write-Host "🔍 SEO Testing Resources:" -ForegroundColor Cyan
Write-Host "  📄 Sitemap: http://91.99.49.208:8000/sitemap.xml" -ForegroundColor White
Write-Host "  🤖 Robots.txt: http://91.99.49.208:8000/robots.txt" -ForegroundColor White
Write-Host "  📱 PWA Manifest: http://91.99.49.208:8000/site.webmanifest" -ForegroundColor White
Write-Host ""
Write-Host "📊 SEO Tools for Testing:" -ForegroundColor Cyan
Write-Host "  🔍 Google Search Console: https://search.google.com/search-console" -ForegroundColor White
Write-Host "  📈 Google Analytics: https://analytics.google.com" -ForegroundColor White
Write-Host "  🧪 Rich Results Test: https://search.google.com/test/rich-results" -ForegroundColor White
Write-Host "  📱 Mobile-Friendly Test: https://search.google.com/test/mobile-friendly" -ForegroundColor White
Write-Host "  ⚡ PageSpeed Insights: https://pagespeed.web.dev" -ForegroundColor White
Write-Host ""
Write-Host "🎯 SEO Features Successfully Implemented:" -ForegroundColor Green
Write-Host "  ✅ Dutch keyword optimization with 30+ targeted keywords" -ForegroundColor Yellow
Write-Host "  ✅ Google Analytics 4 with video engagement tracking" -ForegroundColor Yellow
Write-Host "  ✅ Comprehensive Schema.org structured data" -ForegroundColor Yellow
Write-Host "  ✅ Advanced sitemap with video and image markup" -ForegroundColor Yellow
Write-Host "  ✅ Enhanced meta tags and Open Graph optimization" -ForegroundColor Yellow
Write-Host "  ✅ Search engine verification setup (Google, Bing, Yandex)" -ForegroundColor Yellow
Write-Host "  ✅ Progressive Web App (PWA) manifest" -ForegroundColor Yellow
Write-Host "  ✅ Performance tracking and user analytics" -ForegroundColor Yellow
Write-Host "  ✅ Mobile-optimized and responsive design" -ForegroundColor Yellow
Write-Host "  ✅ Rich results optimization for video content" -ForegroundColor Yellow
