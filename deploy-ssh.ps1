# BitZomax SSH Deployment Script
# This script deploys the authentication fixes to the server via SSH

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerHost = "bitzomax.nl",
    
    [Parameter(Mandatory=$true)]
    [string]$Username = "root",
    
    [string]$DeployPath = "/opt/bitzomax/bitzomax-NL"
)

Write-Host "🚀 Starting SSH Deployment to $ServerHost..." -ForegroundColor Green

# Check if required files exist
$requiredFiles = @(
    "frontend\src\environments\environment.prod.ts",
    "frontend\src\app\services\auth.service.ts",
    "frontend\src\app\app.config.ts",
    "frontend\src\app\interceptors\auth.interceptor.ts",
    "frontend\src\app\components\admin\video-upload\video-upload.component.ts",
    "frontend\src\app\components\debug\auth-debug\auth-debug.component.ts"
)

Write-Host "📋 Checking required files..." -ForegroundColor Yellow
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "❌ Missing file: $file" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "✅ Found: $file" -ForegroundColor Green
    }
}

# Create temporary deployment package
$tempDir = "temp_deploy_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "📦 Creating deployment package in $tempDir..." -ForegroundColor Yellow

New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# Copy modified files to temp directory
$deployFiles = @{
    "frontend\src\environments\environment.prod.ts" = "$tempDir\environment.prod.ts"
    "frontend\src\app\services\auth.service.ts" = "$tempDir\auth.service.ts" 
    "frontend\src\app\app.config.ts" = "$tempDir\app.config.ts"
    "frontend\src\app\interceptors\auth.interceptor.ts" = "$tempDir\auth.interceptor.ts"
    "frontend\src\app\components\admin\video-upload\video-upload.component.ts" = "$tempDir\video-upload.component.ts"
    "frontend\src\app\components\debug\auth-debug\auth-debug.component.ts" = "$tempDir\auth-debug.component.ts"
    "sample_videos.sql" = "$tempDir\sample_videos.sql"
    "AUTHENTICATION_FIXES.md" = "$tempDir\AUTHENTICATION_FIXES.md"
}

foreach ($source in $deployFiles.Keys) {
    $dest = $deployFiles[$source]
    Copy-Item $source $dest
    Write-Host "  📄 Copied: $source" -ForegroundColor Cyan
}

# Create deployment script for server
$serverScript = @"
#!/bin/bash
echo "🚀 Starting BitZomax Authentication Fixes Deployment on Server..."

DEPLOY_PATH="$DeployPath"
BACKUP_DIR="/opt/bitzomax/backup_`$(date +%Y%m%d_%H%M%S)"

# Create backup
echo "💾 Creating backup at `$BACKUP_DIR..."
mkdir -p `$BACKUP_DIR
cp -r `$DEPLOY_PATH/frontend/src/environments `$BACKUP_DIR/
cp -r `$DEPLOY_PATH/frontend/src/app/services `$BACKUP_DIR/
cp -r `$DEPLOY_PATH/frontend/src/app/app.config.ts `$BACKUP_DIR/

# Copy new files
echo "📁 Copying updated files..."
cp /tmp/bitzomax_deploy/environment.prod.ts `$DEPLOY_PATH/frontend/src/environments/
cp /tmp/bitzomax_deploy/auth.service.ts `$DEPLOY_PATH/frontend/src/app/services/
cp /tmp/bitzomax_deploy/app.config.ts `$DEPLOY_PATH/frontend/src/app/
mkdir -p `$DEPLOY_PATH/frontend/src/app/interceptors
cp /tmp/bitzomax_deploy/auth.interceptor.ts `$DEPLOY_PATH/frontend/src/app/interceptors/
cp /tmp/bitzomax_deploy/video-upload.component.ts `$DEPLOY_PATH/frontend/src/app/components/admin/video-upload/
mkdir -p `$DEPLOY_PATH/frontend/src/app/components/debug/auth-debug
cp /tmp/bitzomax_deploy/auth-debug.component.ts `$DEPLOY_PATH/frontend/src/app/components/debug/auth-debug/

# Build and deploy
echo "🔨 Building frontend..."
cd `$DEPLOY_PATH/frontend
npm run build -- --configuration production

if [ `$? -ne 0 ]; then
    echo "❌ Frontend build failed! Restoring backup..."
    cp -r `$BACKUP_DIR/* `$DEPLOY_PATH/frontend/src/
    exit 1
fi

# Restart containers
echo "🐳 Restarting Docker containers..."
cd `$DEPLOY_PATH
docker-compose down
docker-compose build
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 30

# Test authentication
echo "🧪 Testing authentication endpoint..."
response=`$(curl -s -o /dev/null -w "%{http_code}" https://bitzomax.nl/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

if [ "`$response" = "200" ]; then
    echo "✅ Authentication endpoint is working"
else
    echo "⚠️  Authentication endpoint returned status: `$response"
fi

# Deploy sample videos (optional)
if [ -f "/tmp/bitzomax_deploy/sample_videos.sql" ]; then
    echo "📊 Deploying sample video data..."
    postgres_container=`$(docker ps --filter "name=postgres" --format "{{.Names}}" | head -1)
    if [ -n "`$postgres_container" ]; then
        docker exec -i "`$postgres_container" psql -U bitzomax -d bitzomax < /tmp/bitzomax_deploy/sample_videos.sql
        echo "✅ Sample video data deployed"
    fi
fi

echo "🎉 Deployment completed successfully!"
echo "🌐 Application URL: https://bitzomax.nl"
echo "🔑 Admin Login: admin / admin123"

# Cleanup
rm -rf /tmp/bitzomax_deploy
"@

$serverScript | Out-File -FilePath "$tempDir\deploy_server.sh" -Encoding UTF8

Write-Host "✅ Deployment package created" -ForegroundColor Green

# Transfer files to server
Write-Host "📡 Transferring files to server..." -ForegroundColor Yellow

# Check if SSH/SCP is available
try {
    $sshVersion = ssh -V 2>&1
    Write-Host "  SSH client found: $sshVersion" -ForegroundColor Cyan
} catch {
    Write-Host "❌ SSH client not found. Please install OpenSSH or use PuTTY/WinSCP" -ForegroundColor Red
    Write-Host "  You can install OpenSSH via: Add-WindowsCapability -Online -Name OpenSSH.Client" -ForegroundColor Yellow
    exit 1
}

# Create remote temp directory and copy files
Write-Host "  📂 Creating remote temp directory..." -ForegroundColor Cyan
$createTempCmd = "ssh $Username@$ServerHost 'mkdir -p /tmp/bitzomax_deploy'"
Invoke-Expression $createTempCmd

Write-Host "  📤 Uploading files..." -ForegroundColor Cyan
$scpCmd = "scp -r $tempDir/* $Username@${ServerHost}:/tmp/bitzomax_deploy/"
Invoke-Expression $scpCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ File transfer failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Files transferred successfully" -ForegroundColor Green

# Execute deployment script on server
Write-Host "🚀 Executing deployment on server..." -ForegroundColor Yellow
$deployCmd = "ssh $Username@$ServerHost 'chmod +x /tmp/bitzomax_deploy/deploy_server.sh && /tmp/bitzomax_deploy/deploy_server.sh'"
Invoke-Expression $deployCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Post-deployment checklist:" -ForegroundColor Yellow
    Write-Host "- [ ] Test admin login at https://bitzomax.nl" -ForegroundColor White
    Write-Host "- [ ] Test user registration" -ForegroundColor White
        Write-Host "- [ ] Test video upload" -ForegroundColor White
    Write-Host "- [ ] Verify session persistence after page refresh" -ForegroundColor White
    Write-Host "- [ ] Check that HTTPS URLs resolve mixed content issues" -ForegroundColor White
} else {
    Write-Host "❌ Deployment failed! Check server logs" -ForegroundColor Red
}

# Cleanup local temp directory
Write-Host "🧹 Cleaning up temporary files..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $tempDir

Write-Host ""
Write-Host "🌐 Application URL: https://bitzomax.nl" -ForegroundColor Cyan
Write-Host "🔑 Admin credentials: admin / admin123" -ForegroundColor Cyan
Write-Host ""
Write-Host "For troubleshooting, see: AUTHENTICATION_FIXES.md" -ForegroundColor Gray

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
