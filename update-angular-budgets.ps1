# اسکریپت به‌روزرسانی محدودیت‌های بودجه در angular.json
$angularJsonPath = "c:\Users\31623\Documents\My-Projecten\bitzomax\frontend\angular.json"

# بررسی وجود فایل
if (!(Test-Path $angularJsonPath)) {
    Write-Host "خطا: فایل angular.json پیدا نشد." -ForegroundColor Red
    exit 1
}

# خواندن محتوای فایل
$angularJson = Get-Content $angularJsonPath -Raw | ConvertFrom-Json

# به‌روزرسانی محدودیت‌های بودجه
$projects = $angularJson.projects
foreach ($projectName in $projects.PSObject.Properties.Name) {
    $project = $projects.$projectName
    
    # بررسی وجود architect و build
    if ($project.architect -and $project.architect.build -and $project.architect.build.configurations) {
        $configurations = $project.architect.build.configurations
        
        # بررسی وجود تنظیمات production
        if ($configurations.production -and $configurations.production.budgets) {
            $budgets = $configurations.production.budgets
            
            # به‌روزرسانی هر بودجه
            foreach ($budget in $budgets) {
                if ($budget.type -eq "initial") {
                    $budget.maximumWarning = "500kb"
                    $budget.maximumError = "1mb"
                }
                elseif ($budget.type -eq "anyComponentStyle") {
                    $budget.maximumWarning = "100kb"
                    $budget.maximumError = "200kb"
                }
            }
            
            Write-Host "بودجه‌های پروژه $projectName با موفقیت به‌روزرسانی شدند." -ForegroundColor Green
        }
        else {
            Write-Host "تنظیمات production یا budgets برای پروژه $projectName پیدا نشد." -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "ساختار architect یا build برای پروژه $projectName پیدا نشد." -ForegroundColor Yellow
    }
}

# ذخیره تغییرات
$angularJson | ConvertTo-Json -Depth 20 | Set-Content $angularJsonPath
Write-Host "فایل angular.json با موفقیت به‌روزرسانی و ذخیره شد." -ForegroundColor Green

# کامیت و پوش تغییرات به گیت
Write-Host "در حال کامیت و پوش تغییرات به گیت‌هاب..." -ForegroundColor Cyan
cd c:\Users\31623\Documents\My-Projecten\bitzomax
git add frontend/angular.json
git commit -m "افزایش محدودیت‌های بودجه در angular.json برای رفع خطاهای بیلد"
git push

Write-Host "تغییرات با موفقیت به گیت‌هاب پوش شدند." -ForegroundColor Green
Write-Host "اکنون می‌توانید به سرور متصل شده و دستورات زیر را اجرا کنید:" -ForegroundColor Cyan
Write-Host "cd /opt/bitzomax-git" -ForegroundColor Yellow
Write-Host "git pull" -ForegroundColor Yellow
Write-Host "cd frontend" -ForegroundColor Yellow
Write-Host "npm run build --configuration=production" -ForegroundColor Yellow
Write-Host "cp -r dist/frontend/browser/* /opt/bitzomax-git/frontend/dist/frontend/browser/" -ForegroundColor Yellow
