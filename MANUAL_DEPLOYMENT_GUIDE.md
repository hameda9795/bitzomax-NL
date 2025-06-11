# 🚀 Manual Deployment Guide - Video Edit Functionality
# راهنمای Manual Deploy کردن قابلیت ویرایش ویدیو

## Summary
We have successfully implemented video edit/update functionality and committed it to Git. 
Now you need to deploy it manually on your server.

## ✅ What's Already Done:
1. ✅ Backend: Added `updateVideo` method in VideoService
2. ✅ Backend: Added `PUT /api/videos/{id}` endpoint in VideoController  
3. ✅ Frontend: Created complete video-edit component
4. ✅ Frontend: Added edit button to admin dashboard
5. ✅ Frontend: Added routing for `/admin/video-edit/:id`
6. ✅ Git: All changes committed and pushed to repository

## 🔧 Manual Deployment Steps:

### Step 1: Connect to Your Server
```bash
ssh root@185.81.98.159
```

### Step 2: Navigate to Project Directory
```bash
cd /var/www/bitzomax
```

### Step 3: Pull Latest Changes
```bash
git pull origin master
```

### Step 4: Build Backend
```bash
cd backend
./mvnw clean package -DskipTests
cd ..
```

### Step 5: Build Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### Step 6: Stop Services
```bash
sudo systemctl stop bitzomax-backend
sudo systemctl stop nginx
```

### Step 7: Deploy Frontend Files
```bash
sudo cp -r frontend/dist/frontend/* /var/www/html/
```

### Step 8: Start Services
```bash
sudo systemctl start bitzomax-backend
sudo systemctl start nginx
```

### Step 9: Verify Deployment
```bash
sudo systemctl status bitzomax-backend
sudo systemctl status nginx
```

## 🧪 Testing the Deployment:

1. **Open browser**: Go to `https://bitzomax.nl`
2. **Login as admin**: Use admin credentials
3. **Navigate to admin**: Go to `https://bitzomax.nl/admin`
4. **Click Videos tab**: In the admin dashboard
5. **Test edit button**: Click "✏️ Bewerken" on any video
6. **Verify edit form**: Should load with current video data
7. **Test update**: Make changes and click "Video Bijwerken"

## 🎯 Expected Results:

- ✅ Edit button appears next to "Bekijken" and "Verwijderen"
- ✅ Edit form loads with pre-populated video data
- ✅ Form shows current video preview
- ✅ Optional file upload works (keeps existing if not changed)
- ✅ Update saves successfully and redirects to dashboard
- ✅ Backend API endpoint `PUT /api/videos/{id}` works

## 🔍 Troubleshooting:

### If Backend Issues:
```bash
# Check backend logs
sudo journalctl -u bitzomax-backend -f

# Check if backend is running
sudo systemctl status bitzomax-backend

# Restart backend if needed
sudo systemctl restart bitzomax-backend
```

### If Frontend Issues:
```bash
# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Check if files copied correctly
ls -la /var/www/html/

# Restart nginx if needed
sudo systemctl restart nginx
```

### If Edit Button Missing:
- Clear browser cache
- Check console for JavaScript errors
- Verify admin authentication

## 📋 New Files Added:
- `frontend/src/app/components/admin/video-edit/video-edit.component.ts`
- `frontend/src/app/components/admin/video-edit/video-edit.component.html`
- `frontend/src/app/components/admin/video-edit/video-edit.component.scss`

## 🔗 Modified Files:
- `backend/src/main/java/com/bitzomax/service/VideoService.java`
- `backend/src/main/java/com/bitzomax/controller/VideoController.java`
- `frontend/src/app/services/video.service.ts`
- `frontend/src/app/app.routes.ts`
- `frontend/src/app/app.routes.server.ts`
- `frontend/src/app/components/admin/admin-dashboard/admin-dashboard.component.html`
- `frontend/src/app/components/admin/admin-dashboard/admin-dashboard.component.scss`

## 🌐 Final Test URL:
After deployment, test at: `https://bitzomax.nl/admin`

---

**نکته:** اگر مشکلی بود، مراحل را یکی یکی اجرا کنید و خروجی هر دستور را چک کنید.
**Note:** If there are issues, execute steps one by one and check output of each command.
