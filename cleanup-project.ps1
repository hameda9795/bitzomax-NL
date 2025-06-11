# پاک کردن فایل‌های اضافی پروژه BitZomax
# BitZomax Project Cleanup Script

Write-Host "🧹 شروع پاک کردن فایل‌های اضافی پروژه BitZomax..." -ForegroundColor Green
Write-Host "🧹 Starting BitZomax project cleanup..." -ForegroundColor Green

$filesDeleted = 0
$foldersDeleted = 0

# تابع برای پاک کردن فایل
function Remove-FileIfExists {
    param($filePath)
    if (Test-Path $filePath) {
        Remove-Item $filePath -Force
        Write-Host "✅ حذف شد: $filePath" -ForegroundColor Yellow
        $script:filesDeleted++
    }
}

# تابع برای پاک کردن پوشه
function Remove-FolderIfExists {
    param($folderPath)
    if (Test-Path $folderPath) {
        Remove-Item $folderPath -Recurse -Force
        Write-Host "✅ پوشه حذف شد: $folderPath" -ForegroundColor Yellow
        $script:foldersDeleted++
    }
}

Write-Host "`n📋 فایل‌های Documentation و Test اضافی..." -ForegroundColor Cyan

# فایل‌های مستندات اضافی (نگه داشتن فقط README.md اصلی)
Remove-FileIfExists "AUTHENTICATION_FIX_SUCCESS.md"
Remove-FileIfExists "AUTHENTICATION_FIX_SUMMARY.md" 
Remove-FileIfExists "AUTHENTICATION_FIXES.md"
Remove-FileIfExists "COMPLETE_HEADER_TEST.md"
Remove-FileIfExists "ENHANCED_AUTH_FIX_SUMMARY.md"
Remove-FileIfExists "ENHANCED_AUTH_TEST_GUIDE.md"
Remove-FileIfExists "FINAL_AUTH_TEST_GUIDE.md"
Remove-FileIfExists "FINAL_DEPLOYMENT_SUCCESS.md"
Remove-FileIfExists "HEADER_AUTH_FIX_FINAL.md"
Remove-FileIfExists "HEADER_PERSISTENCE_TEST.md"
Remove-FileIfExists "HTTPS_MIXED_CONTENT_FIX.md"
Remove-FileIfExists "IMPROVEMENTS_SUMMARY.md"
Remove-FileIfExists "MANUAL_DEPLOYMENT_GUIDE.md"
Remove-FileIfExists "MEGA_ULTIMATE_AUTH_FIX_DEPLOYED.md"
Remove-FileIfExists "PERSISTENCE_TEST_PROTOCOL.md"
Remove-FileIfExists "SSH_DEPLOYMENT_GUIDE.md"
Remove-FileIfExists "ULTIMATE_AUTH_FIX_DEPLOYED.md"
Remove-FileIfExists "DEPLOYMENT_SUCCESS_SUMMARY.md"

Write-Host "`n📋 فایل‌های Test اضافی..." -ForegroundColor Cyan

# فایل‌های تست اضافی
Remove-FileIfExists "debug-auth-live.html"
Remove-FileIfExists "localStorage-test.html"
Remove-FileIfExists "image_fallback_test.html"
Remove-FileIfExists "test_cors.html"
Remove-FileIfExists "quick-header-test.js"
Remove-FileIfExists "mega-ultimate-auth-test.js"
Remove-FileIfExists "ultimate-auth-test.js"
Remove-FileIfExists "test-persistence-final.js"

Write-Host "`n📋 فایل‌های Deploy اضافی..." -ForegroundColor Cyan

# فایل‌های deployment اضافی
Remove-FileIfExists "deploy-auth-fixes.ps1"
Remove-FileIfExists "deploy-auth-fixes.sh"
Remove-FileIfExists "deploy-auth-persistence-fix.ps1"
Remove-FileIfExists "deploy-mixed-content-fix.ps1"
Remove-FileIfExists "deploy-ssh.ps1"
Remove-FileIfExists "deploy-video-edit.ps1"
Remove-FileIfExists "deploy-video-edit.sh"
Remove-FileIfExists "deploy-video-edit-bash.sh"
Remove-FileIfExists "server-deploy.sh"
Remove-FileIfExists "test-auth-fixes.ps1"
Remove-FileIfExists "test-auth-persistence.ps1"
Remove-FileIfExists "test-auth-live.sh"
Remove-FileIfExists "verify-auth-fix.ps1"
Remove-FileIfExists "check-deployment-status.ps1"
Remove-FileIfExists "sync-uploads.sh"

Write-Host "`n📋 فایل‌های Frontend اضافی..." -ForegroundColor Cyan

# فایل‌های frontend اضافی
Remove-FileIfExists "frontend\direct-auth-test.html"
Remove-FileIfExists "frontend\test-auth-fix.html"
Remove-FileIfExists "frontend\test-live-auth.html"
Remove-FileIfExists "frontend\test-refresh-persistence.html"
Remove-FileIfExists "frontend\DEBUG_REFRESH_TEST.md"
Remove-FileIfExists "frontend\FINAL_AUTH_SERVICE_FIX.ts"
Remove-FileIfExists "frontend\UPDATED_AUTH_SERVICE.ts"
Remove-FileIfExists "frontend\clean_login.json"
Remove-FileIfExists "frontend\signup.json"
Remove-FileIfExists "frontend\test_signup.json"

Write-Host "`n📋 فایل‌های Nginx اضافی..." -ForegroundColor Cyan

# فایل‌های nginx اضافی (نگه داشتن فقط nginx.conf اصلی)
Remove-FileIfExists "frontend\bitzomax.nl.conf"
Remove-FileIfExists "frontend\fixed_nginx.conf"
Remove-FileIfExists "frontend\host_nginx.conf"
Remove-FileIfExists "frontend\host_nginx_fixed.conf"
Remove-FileIfExists "frontend\host_nginx_with_upload.conf"
Remove-FileIfExists "frontend\new_bitzomax.nl.conf"
Remove-FileIfExists "frontend\nginx_corrected.conf"
Remove-FileIfExists "frontend\nginx_fixed.conf"
Remove-FileIfExists "frontend\simple_nginx.conf"
Remove-FileIfExists "frontend\updated_bitzomax.nl.conf"
Remove-FileIfExists "frontend\fix_nginx.sh"

Write-Host "`n📋 فایل‌های Docker Compose اضافی..." -ForegroundColor Cyan

# فایل‌های docker compose اضافی (نگه داشتن فقط docker-compose.yml اصلی)
Remove-FileIfExists "frontend\docker-compose-cors.yml"
Remove-FileIfExists "frontend\docker-compose-final.yml"

Write-Host "`n📋 فایل‌های JSON Test اضافی..." -ForegroundColor Cyan

# فایل‌های test json اضافی
Remove-FileIfExists "test_login.json"

Write-Host "`n✅ خلاصه پاک‌سازی:" -ForegroundColor Green
Write-Host "📁 فایل‌های حذف شده: $filesDeleted" -ForegroundColor White
Write-Host "📁 پوشه‌های حذف شده: $foldersDeleted" -ForegroundColor White

Write-Host "`n🎯 فایل‌های اصلی که نگه داشته شده‌اند:" -ForegroundColor Green
Write-Host "- README.md (مستندات اصلی)" -ForegroundColor White
Write-Host "- DEPLOYMENT.md (راهنمای deployment اصلی)" -ForegroundColor White
Write-Host "- docker-compose.yml (پیکربندی Docker اصلی)" -ForegroundColor White
Write-Host "- پوشه backend/ (کد اصلی بک‌اند)" -ForegroundColor White
Write-Host "- پوشه frontend/src/ (کد اصلی فرانت‌اند)" -ForegroundColor White
Write-Host "- فایل‌های SQL اصلی" -ForegroundColor White

Write-Host "`n🎉 پاک‌سازی پروژه با موفقیت تکمیل شد!" -ForegroundColor Green
Write-Host "🎉 Project cleanup completed successfully!" -ForegroundColor Green
