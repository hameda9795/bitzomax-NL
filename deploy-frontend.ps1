# PowerShell script to build and deploy updated Angular frontend

# Navigate to the frontend directory
Set-Location -Path "C:\Users\31623\Documents\My-Projecten\bitzomax\frontend"

# Build the Angular app with production settings
Write-Host "Building Angular app with production settings..." -ForegroundColor Green
npm run build --configuration=production

# Create deployment package
Write-Host "Creating deployment package..." -ForegroundColor Green
Set-Location -Path ".\dist\frontend\browser"

# Check if 7-Zip is available
$sevenZipPath = "C:\Program Files\7-Zip\7z.exe"
if (Test-Path $sevenZipPath) {
    & "$sevenZipPath" a -tzip frontend-dist.zip *
} else {
    # Fallback to PowerShell's Compress-Archive
    Compress-Archive -Path * -DestinationPath frontend-dist.zip -Force
}

Write-Host "Build complete! frontend-dist.zip is ready in the dist/frontend/browser folder." -ForegroundColor Green
Write-Host "Please upload this file to the server and extract it to /opt/bitzomax-git/frontend/dist/frontend/browser/" -ForegroundColor Cyan
