#!/bin/bash
# اسکریپت انتقال داده‌ها از دیتابیس H2 به PostgreSQL

echo "شروع فرآیند انتقال داده‌ها..."

# مسیر پروژه بیتزومکس
PROJECT_DIR="/opt/bitzomax-git"

# مسیر پشتیبان‌گیری
BACKUP_DIR="/opt/bitzomax-backup"
mkdir -p $BACKUP_DIR

# تاریخ برای نام فایل پشتیبان
DATE=$(date +"%Y%m%d-%H%M%S")

# بررسی وجود فایل دیتابیس H2
if [ ! -f "$PROJECT_DIR/backend/data/bitzomax.mv.db" ]; then
    echo "خطا: فایل دیتابیس H2 یافت نشد!"
    exit 1
fi

# پشتیبان‌گیری از دیتابیس H2
echo "در حال پشتیبان‌گیری از دیتابیس H2..."
cp "$PROJECT_DIR/backend/data/bitzomax.mv.db" "$BACKUP_DIR/bitzomax-$DATE.mv.db"

# توقف سرویس بک‌اند
echo "در حال توقف سرویس بیتزومکس..."
sudo systemctl stop bitzomax

# اجرای اپلیکیشن با پروفایل prod برای ایجاد جداول در PostgreSQL
echo "در حال ایجاد اسکیمای دیتابیس در PostgreSQL..."
cd $PROJECT_DIR/backend
java -jar target/bitzomax-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod --spring.jpa.hibernate.ddl-auto=create

# اجرای اسکریپت SQL برای انتقال داده‌ها
echo "در حال ایجاد کاربر ادمین در دیتابیس..."
sudo -u postgres psql -d bitzomax -c "INSERT INTO users (email, password, username, created_at, updated_at) VALUES ('admin@bitzomax.com', '\$2a\$10\$7HurIx6rXPDBNOWJl4BV1uDuVmi9OKH9tYF/nEzRLOYOZ/2PLkn2u', 'admin', now(), now());"
sudo -u postgres psql -d bitzomax -c "INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);"
sudo -u postgres psql -d bitzomax -c "INSERT INTO user_roles (user_id, role_id) VALUES (1, 2);"

# پیکربندی و راه‌اندازی مجدد سرویس
echo "در حال تنظیم فایل سرویس..."
cat > /tmp/bitzomax.service << EOF
[Unit]
Description=Bitzomax Spring Boot Application
After=network.target

[Service]
User=root
WorkingDirectory=/opt/bitzomax-git/backend
ExecStart=/usr/bin/java -jar target/bitzomax-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo mv /tmp/bitzomax.service /etc/systemd/system/bitzomax.service
sudo systemctl daemon-reload

# راه‌اندازی مجدد سرویس
echo "در حال راه‌اندازی مجدد سرویس..."
sudo systemctl start bitzomax
sudo systemctl enable bitzomax

echo "فرآیند انتقال داده‌ها به پایان رسید."
echo "اکنون می‌توانید با نام کاربری 'admin' و رمز عبور '123456' وارد سیستم شوید."
