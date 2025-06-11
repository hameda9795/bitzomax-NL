# PowerShell deployment script for Windows users
Write-Host "🚀 Starting production deployment for file serving fix..." -ForegroundColor Green

# Pull latest changes
Write-Host "📥 Pulling latest changes from repository..." -ForegroundColor Yellow
git pull

# Stop all containers
Write-Host "🛑 Stopping all containers..." -ForegroundColor Yellow
docker-compose down

# Remove old images to force rebuild
Write-Host "🗑️ Removing old Docker images..." -ForegroundColor Yellow
docker rmi bitzomax-frontend bitzomax-backend 2>$null

# Rebuild and start containers
Write-Host "🔨 Rebuilding and starting containers..." -ForegroundColor Yellow
docker-compose up -d --build

# Wait for services to start
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep 30

# Check container status
Write-Host "📊 Checking container status..." -ForegroundColor Yellow
docker-compose ps

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host "🌐 Please check https://bitzomax.nl to verify file display is working" -ForegroundColor Cyan
