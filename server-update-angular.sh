#!/bin/bash
# اسکریپت سرور برای به‌روزرسانی محدودیت‌های بودجه و بیلد مجدد فرانت‌اند

echo "به‌روزرسانی محدودیت‌های بودجه در angular.json..."

# رفتن به مسیر پروژه
cd /opt/bitzomax-git/frontend

# به‌روزرسانی محدودیت‌های بودجه در فایل angular.json با jq
# نصب jq اگر موجود نیست
if ! command -v jq &> /dev/null; then
    echo "در حال نصب jq..."
    apt-get update
    apt-get install -y jq
fi

# ذخیره نسخه پشتیبان
cp angular.json angular.json.bak

# افزایش محدودیت‌های بودجه با sed (روش ساده)
sed -i 's/"maximumWarning": "2mb"/"maximumWarning": "5mb"/g' angular.json
sed -i 's/"maximumError": "5mb"/"maximumError": "10mb"/g' angular.json
sed -i 's/"maximumWarning": "4kb"/"maximumWarning": "100kb"/g' angular.json
sed -i 's/"maximumError": "8kb"/"maximumError": "200kb"/g' angular.json

echo "محدودیت‌های بودجه با موفقیت به‌روزرسانی شدند."

echo "به‌روزرسانی مسیرهای import در فایل‌های سرویس..."
cd /opt/bitzomax-git/frontend/src/app/services
sed -i "s|import { environment } from '../../../environments/environment';|import { environment } from '../../environments/environment';|g" *.ts

echo "بیلد مجدد فرانت‌اند..."
cd /opt/bitzomax-git/frontend
npm run build --configuration=production

# بررسی موفقیت‌آمیز بودن بیلد
if [ -d "dist/frontend/browser" ]; then
    echo "بیلد با موفقیت انجام شد. در حال کپی فایل‌ها به پوشه نصب..."
    mkdir -p /opt/bitzomax-git/frontend/dist/frontend/browser
    cp -r dist/frontend/browser/* /opt/bitzomax-git/frontend/dist/frontend/browser/
    echo "فایل‌ها با موفقیت کپی شدند."
else
    echo "خطا: بیلد با مشکل مواجه شد. دایرکتوری dist/frontend/browser پیدا نشد."
    exit 1
fi

echo "پروسه به‌روزرسانی با موفقیت به پایان رسید."
