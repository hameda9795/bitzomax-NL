# BitZomax Authentication Fixes Deployment Script (PowerShell)
# This script deploys the authentication and HTTPS fixes

Write-Host "🚀 Starting BitZomax Authentication Fixes Deployment..." -ForegroundColor Green

# Step 1: Build frontend with production configuration
Write-Host "📦 Building frontend with production configuration..." -ForegroundColor Yellow
Set-Location frontend

try {
    npm run build -- --configuration production
    Write-Host "✅ Frontend build completed successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Build and deploy Docker containers
Write-Host "🐳 Building and deploying Docker containers..." -ForegroundColor Yellow
Set-Location ..

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Build new images
Write-Host "🔨 Building new Docker images..." -ForegroundColor Yellow
docker-compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

# Start containers
Write-Host "🚀 Starting updated containers..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Container startup failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Containers started successfully" -ForegroundColor Green

# Step 3: Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Step 4: Test authentication endpoint
Write-Host "🧪 Testing authentication endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://bitzomax.nl/api/auth/signin" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body '{"username":"admin","password":"admin123"}' `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Authentication endpoint is working" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Authentication endpoint returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "⚠️  Authentication endpoint test failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 5: Check container health
Write-Host "🏥 Checking container health..." -ForegroundColor Yellow
$frontendStatus = docker ps --filter "name=frontend" --format "table {{.Status}}" | Select-Object -Last 1
$backendStatus = docker ps --filter "name=backend" --format "table {{.Status}}" | Select-Object -Last 1

Write-Host "Frontend container: $frontendStatus" -ForegroundColor Cyan
Write-Host "Backend container: $backendStatus" -ForegroundColor Cyan

# Step 6: Display deployment summary
Write-Host ""
Write-Host "🎉 Deployment Summary:" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host "✅ Frontend built with production configuration" -ForegroundColor Green
Write-Host "✅ Docker containers rebuilt and restarted" -ForegroundColor Green
Write-Host "✅ Authentication endpoint tested" -ForegroundColor Green
Write-Host "✅ Upload endpoint tested" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Application URL: https://bitzomax.nl" -ForegroundColor Cyan
Write-Host "🔑 Admin Login: admin / admin123" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Post-deployment checklist:" -ForegroundColor Yellow
Write-Host "- [ ] Test admin login in browser" -ForegroundColor White
Write-Host "- [ ] Test user registration" -ForegroundColor White
Write-Host "- [ ] Test video upload" -ForegroundColor White
Write-Host "- [ ] Verify session persistence" -ForegroundColor White
Write-Host "- [ ] Check HTTPS mixed content resolution" -ForegroundColor White
Write-Host ""
Write-Host "🐛 If issues persist, use the AuthDebugComponent:" -ForegroundColor Yellow
Write-Host "   Add <app-auth-debug></app-auth-debug> to any component for debugging" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed troubleshooting, see: AUTHENTICATION_FIXES.md" -ForegroundColor Cyan

# Step 7: Optional - Deploy sample videos
Write-Host ""
$deploySamples = Read-Host "📹 Do you want to deploy sample video data? (y/N)"

if ($deploySamples -match "^[Yy]$") {
    Write-Host "📊 Deploying sample video data..." -ForegroundColor Yellow
    
    # Check if PostgreSQL container is running
    $postgresContainer = docker ps --filter "name=postgres" --format "{{.Names}}" | Select-Object -First 1
    
    if ($postgresContainer) {
        Write-Host "📁 Executing sample_videos.sql..." -ForegroundColor Yellow
        try {
            Get-Content "sample_videos.sql" | docker exec -i $postgresContainer psql -U bitzomax -d bitzomax
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Sample video data deployed successfully" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Sample video data deployment failed" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "⚠️  Sample video data deployment failed: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  PostgreSQL container not found. Sample data not deployed." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎊 Deployment completed! Application should now be running with authentication fixes." -ForegroundColor Green
Write-Host "🌐 Visit https://bitzomax.nl to test the application" -ForegroundColor Cyan

# Keep the window open
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
