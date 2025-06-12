#!/usr/bin/env pwsh
# Deployment script for lazy loading video feature

Write-Host "Starting deployment of lazy loading video feature..." -ForegroundColor Cyan

# Navigate to the project root directory
$PROJECT_ROOT = $PSScriptRoot

# Build Frontend
Write-Host "Building frontend..." -ForegroundColor Green
Set-Location "$PROJECT_ROOT/frontend"
npm install
npm run build --prod

# Build Backend (if any backend changes were made)
Write-Host "Building backend..." -ForegroundColor Green
Set-Location "$PROJECT_ROOT/backend"
./mvnw clean package -DskipTests

# Deploy the applications
Write-Host "Deploying applications..." -ForegroundColor Green

# Check if Docker is running
if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Host "Docker is not installed or not in PATH. Please install Docker and try again." -ForegroundColor Red
    exit 1
}

# Check if docker-compose is available
if (-not (Get-Command "docker-compose" -ErrorAction SilentlyContinue)) {
    Write-Host "Docker Compose is not installed or not in PATH. Please install Docker Compose and try again." -ForegroundColor Red
    exit 1
}

# Return to project root
Set-Location $PROJECT_ROOT

# Build and start containers
Write-Host "Building and starting Docker containers..." -ForegroundColor Green
docker-compose down
docker-compose build
docker-compose up -d

Write-Host "Deployment completed successfully!" -ForegroundColor Cyan
Write-Host "Lazy loading video feature is now live." -ForegroundColor Green

# Optionally, add verification steps
Write-Host "To verify the deployment, browse to: http://localhost:80" -ForegroundColor Yellow
