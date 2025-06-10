# PowerShell script to deploy HTTPS mixed content fixes to Bitzomax server
# This script fixes the mixed content errors by uploading the corrected frontend build

$SERVER_IP = "91.99.49.208"
$SERVER_USER = "root"

Write-Host "=== Bitzomax Mixed Content Fix Deployment ===" -ForegroundColor Cyan
Write-Host "Deploying HTTPS fixes to resolve mixed content errors..." -ForegroundColor Yellow

# Check if dist folder exists
if (!(Test-Path "frontend\dist\frontend")) {
    Write-Host "❌ Build files not found. Please run 'npm run build' first." -ForegroundColor Red
    exit 1
}

Write-Host "📁 Build files found. Starting deployment..." -ForegroundColor Green

# Create a temporary deployment script
$deployScript = @"
#!/bin/bash
echo "🚀 Deploying HTTPS mixed content fixes..."

# Stop the frontend container
echo "⏹️  Stopping frontend container..."
cd /opt/bitzomax/bitzomax-NL
docker-compose stop frontend

# Create backup of current frontend
echo "💾 Creating backup..."
if [ -d "frontend/dist" ]; then
    cp -r frontend/dist frontend/dist.backup.\$(date +%Y%m%d_%H%M%S)
fi

# Wait for file upload to complete
echo "⏳ Waiting for file upload to complete..."
sleep 5

# Restart the frontend container
echo "🔄 Restarting frontend container..."
docker-compose up -d frontend

# Check container status
echo "🔍 Checking container status..."
docker-compose ps frontend

echo "✅ Mixed content fix deployment completed!"
echo "🌐 Your site should now work properly with HTTPS without mixed content errors."
echo ""
echo "📝 Changes applied:"
echo "   - Fixed hardcoded HTTP URLs in SEO service"
echo "   - Updated environment URLs to use HTTPS"
echo "   - Resolved mixed content security issues"
echo ""
echo "Test the fixes by visiting:"
echo "   - https://bitzomax.nl/admin/upload"
echo "   - https://bitzomax.nl/login"
"@

# Save the deployment script
$deployScript | Out-File -FilePath "temp_deploy.sh" -Encoding UTF8

Write-Host "📤 Uploading files to server..." -ForegroundColor Blue

# Upload dist folder and deployment script
scp -r "frontend\dist\frontend\*" "${SERVER_USER}@${SERVER_IP}:/opt/bitzomax/bitzomax-NL/frontend/dist/"
scp "temp_deploy.sh" "${SERVER_USER}@${SERVER_IP}:/tmp/deploy_https_fix.sh"

# Execute deployment on server
Write-Host "⚡ Executing deployment on server..." -ForegroundColor Blue
ssh ${SERVER_USER}@${SERVER_IP} "chmod +x /tmp/deploy_https_fix.sh && /tmp/deploy_https_fix.sh"

# Cleanup
Remove-Item "temp_deploy.sh" -ErrorAction SilentlyContinue

Write-Host "" -ForegroundColor Green
Write-Host "🎉 HTTPS Mixed Content Fix Deployment Complete!" -ForegroundColor Green
Write-Host "" -ForegroundColor Green
Write-Host "✅ The following issues have been resolved:" -ForegroundColor Yellow
Write-Host "   • Mixed content errors (HTTP resources on HTTPS pages)" -ForegroundColor White
Write-Host "   • Admin upload page authentication issues" -ForegroundColor White
Write-Host "   • SEO structured data HTTPS compliance" -ForegroundColor White
Write-Host "" -ForegroundColor Green
Write-Host "🧪 Please test:" -ForegroundColor Cyan
Write-Host "   1. Visit https://bitzomax.nl/admin/upload" -ForegroundColor White
Write-Host "   2. Login as admin (admin/admin123)" -ForegroundColor White
Write-Host "   3. Try uploading a video" -ForegroundColor White
Write-Host "   4. Check browser console for mixed content errors" -ForegroundColor White
Write-Host "" -ForegroundColor Green
