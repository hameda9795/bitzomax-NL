#!/bin/bash
# Video Edit Functionality Deployment Script
# تسکریپت Deploy کردن قابلیت ویرایش ویدیو

echo "🚀 Starting Video Edit Functionality Deployment..."
echo "شروع deploy کردن قابلیت ویرایش ویدیو..."

# Server configuration
SERVER_HOST="root@185.81.98.159"
PROJECT_PATH="/var/www/bitzomax"

echo "📡 Connecting to server..."
echo "اتصال به سرور..."

# Function to execute commands on server
execute_ssh_command() {
    local command="$1"
    local description="$2"
    
    echo "🔧 $description"
    echo "اجرای: $description"
    
    if ssh $SERVER_HOST "$command"; then
        echo "✅ Success: $description"
        echo "موفق: $description"
    else
        echo "❌ Failed: $description"
        echo "ناموفق: $description"
        return 1
    fi
}

# Step 1: Pull latest changes
echo ""
echo "📥 Step 1: Pulling latest changes from Git..."
echo "مرحله ۱: دریافت آخرین تغییرات از Git..."

execute_ssh_command "cd $PROJECT_PATH && git pull origin master" "Git pull" || exit 1

# Step 2: Build backend
echo ""
echo "🔨 Step 2: Building backend..."
echo "مرحله ۲: ساخت backend..."

execute_ssh_command "cd $PROJECT_PATH/backend && ./mvnw clean package -DskipTests" "Backend build" || exit 1

# Step 3: Build frontend
echo ""
echo "🎨 Step 3: Building frontend..."
echo "مرحله ۳: ساخت frontend..."

execute_ssh_command "cd $PROJECT_PATH/frontend && npm install" "Install dependencies" || exit 1
execute_ssh_command "cd $PROJECT_PATH/frontend && npm run build" "Frontend build" || exit 1

# Step 4: Stop services
echo ""
echo "🛑 Step 4: Stopping services..."
echo "مرحله ۴: متوقف کردن سرویس‌ها..."

execute_ssh_command "sudo systemctl stop bitzomax-backend" "Stop backend service"
execute_ssh_command "sudo systemctl stop nginx" "Stop nginx"

# Step 5: Copy built files
echo ""
echo "📁 Step 5: Deploying built files..."
echo "مرحله ۵: کپی فایل‌های ساخته شده..."

execute_ssh_command "sudo cp -r $PROJECT_PATH/frontend/dist/frontend/* /var/www/html/" "Copy frontend files"

# Step 6: Start services
echo ""
echo "▶️ Step 6: Starting services..."
echo "مرحله ۶: شروع مجدد سرویس‌ها..."

execute_ssh_command "sudo systemctl start bitzomax-backend" "Start backend service"
execute_ssh_command "sudo systemctl start nginx" "Start nginx"

# Step 7: Verify services
echo ""
echo "✅ Step 7: Verifying deployment..."
echo "مرحله ۷: تأیید deployment..."

execute_ssh_command "sudo systemctl status bitzomax-backend --no-pager -l" "Check backend status"
execute_ssh_command "sudo systemctl status nginx --no-pager -l" "Check nginx status"

echo ""
echo "🎉 Video Edit Functionality Deployment Complete!"
echo "🎉 deploy قابلیت ویرایش ویدیو با موفقیت انجام شد!"
echo ""
echo "📋 What was deployed:"
echo "✅ Backend: Video update API endpoint (PUT /api/videos/{id})"
echo "✅ Frontend: Video edit component and routing"
echo "✅ UI: Edit button in admin dashboard"
echo "✅ Features: Complete video editing with file uploads"
echo ""
echo "🌐 Test the deployment at: https://bitzomax.nl/admin"
echo "تست کنید در: https://bitzomax.nl/admin"
echo ""
echo "🔍 You can now:"
echo "1. Login as admin"
echo "2. Go to admin dashboard"
echo "3. Click on Videos tab"
echo "4. Click 'Bewerken' (Edit) button on any video"
echo "5. Test the video editing functionality"
echo ""
