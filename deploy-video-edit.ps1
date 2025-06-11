# Video Edit Functionality Deployment Script
# تسکریپت Deploy کردن قابلیت ویرایش ویدیو

Write-Host "🚀 Starting Video Edit Functionality Deployment..." -ForegroundColor Green
Write-Host "شروع deploy کردن قابلیت ویرایش ویدیو..." -ForegroundColor Green

# Check if we have server access
$serverHost = "root@185.81.98.159"
$projectPath = "/var/www/bitzomax"

Write-Host "📡 Connecting to server..." -ForegroundColor Yellow
Write-Host "اتصال به سرور..." -ForegroundColor Yellow

# Function to execute commands on server
function Invoke-SSHCommand {
    param(
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "🔧 $Description" -ForegroundColor Cyan
    Write-Host "اجرای: $Description" -ForegroundColor Cyan
    
    # Use ssh command (assuming SSH is available in PATH)
    $result = ssh $serverHost "$Command"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Success: $Description" -ForegroundColor Green
        Write-Host "موفق: $Description" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed: $Description" -ForegroundColor Red
        Write-Host "ناموفق: $Description" -ForegroundColor Red
        Write-Host "Error: $result" -ForegroundColor Red
    }
    
    return $result
}

try {
    # Step 1: Pull latest changes
    Write-Host "`n📥 Step 1: Pulling latest changes from Git..." -ForegroundColor Blue
    Write-Host "مرحله ۱: دریافت آخرین تغییرات از Git..." -ForegroundColor Blue
    
    Invoke-SSHCommand "cd $projectPath; git pull origin master" "Git pull"
    
    # Step 2: Build backend
    Write-Host "`n🔨 Step 2: Building backend..." -ForegroundColor Blue
    Write-Host "مرحله ۲: ساخت backend..." -ForegroundColor Blue
    
    Invoke-SSHCommand "cd $projectPath/backend; ./mvnw clean package -DskipTests" "Backend build"
    
    # Step 3: Build frontend
    Write-Host "`n🎨 Step 3: Building frontend..." -ForegroundColor Blue
    Write-Host "مرحله ۳: ساخت frontend..." -ForegroundColor Blue
    
    Invoke-SSHCommand "cd $projectPath/frontend; npm install" "Install dependencies"
    Invoke-SSHCommand "cd $projectPath/frontend; npm run build" "Frontend build"
    
    # Step 4: Stop services
    Write-Host "`n🛑 Step 4: Stopping services..." -ForegroundColor Blue
    Write-Host "مرحله ۴: متوقف کردن سرویس‌ها..." -ForegroundColor Blue
    
    Invoke-SSHCommand "sudo systemctl stop bitzomax-backend" "Stop backend service"
    Invoke-SSHCommand "sudo systemctl stop nginx" "Stop nginx"
    
    # Step 5: Copy built files
    Write-Host "`n📁 Step 5: Deploying built files..." -ForegroundColor Blue
    Write-Host "مرحله ۵: کپی فایل‌های ساخته شده..." -ForegroundColor Blue
    
    Invoke-SSHCommand "sudo cp -r $projectPath/frontend/dist/frontend/* /var/www/html/" "Copy frontend files"
    
    # Step 6: Start services
    Write-Host "`n▶️ Step 6: Starting services..." -ForegroundColor Blue
    Write-Host "مرحله ۶: شروع مجدد سرویس‌ها..." -ForegroundColor Blue
    
    Invoke-SSHCommand "sudo systemctl start bitzomax-backend" "Start backend service"
    Invoke-SSHCommand "sudo systemctl start nginx" "Start nginx"
    
    # Step 7: Verify services
    Write-Host "`n✅ Step 7: Verifying deployment..." -ForegroundColor Blue
    Write-Host "مرحله ۷: تأیید deployment..." -ForegroundColor Blue
    
    Invoke-SSHCommand "sudo systemctl status bitzomax-backend --no-pager" "Check backend status"
    Invoke-SSHCommand "sudo systemctl status nginx --no-pager" "Check nginx status"
    
    Write-Host "`n🎉 Video Edit Functionality Deployment Complete!" -ForegroundColor Green
    Write-Host "🎉 deploy قابلیت ویرایش ویدیو با موفقیت انجام شد!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 What was deployed:" -ForegroundColor Yellow
    Write-Host "✅ Backend: Video update API endpoint (PUT /api/videos/{id})" -ForegroundColor White
    Write-Host "✅ Frontend: Video edit component and routing" -ForegroundColor White
    Write-Host "✅ UI: Edit button in admin dashboard" -ForegroundColor White
    Write-Host "✅ Features: Complete video editing with file uploads" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Test the deployment at: https://bitzomax.nl/admin" -ForegroundColor Cyan
    Write-Host "تست کنید در: https://bitzomax.nl/admin" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "❌ deployment ناموفق بود!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
