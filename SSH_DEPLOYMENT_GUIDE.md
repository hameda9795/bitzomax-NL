# Manual SSH Deployment Guide for BitZomax Authentication Fixes

## Quick Deployment Commands

### 1. Connect to Server
```bash
ssh root@bitzomax.nl
```

### 2. Navigate to Project Directory
```bash
cd /opt/bitzomax/bitzomax-NL
```

### 3. Create Backup
```bash
mkdir -p /opt/bitzomax/backup_$(date +%Y%m%d_%H%M%S)
cp -r frontend/src/environments /opt/bitzomax/backup_$(date +%Y%m%d_%H%M%S)/
cp -r frontend/src/app/services /opt/bitzomax/backup_$(date +%Y%m%d_%H%M%S)/
cp frontend/src/app/app.config.ts /opt/bitzomax/backup_$(date +%Y%m%d_%H%M%S)/
```

### 4. Update Critical Files

#### Update environment.prod.ts
```bash
cat > frontend/src/environments/environment.prod.ts << 'EOF'
export const environment = {
  production: true,
  apiUrl: 'https://bitzomax.nl/api',
  uploadsUrl: 'https://bitzomax.nl/api/uploads'
};
EOF
```

#### Create auth interceptor directory and file
```bash
mkdir -p frontend/src/app/interceptors
cat > frontend/src/app/interceptors/auth.interceptor.ts << 'EOF'
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn('Authentication failed, clearing session and redirecting to login');
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          console.warn('Access forbidden - insufficient permissions');
        }
        return throwError(() => error);
      })
    );
  }
}
EOF
```

### 5. Update AuthService (Most Important)
```bash
# You need to copy the updated auth.service.ts content here
# The key changes are in the constructor and initialization
```

### 6. Update app.config.ts
```bash
# Add the HTTP interceptor to the app config
# This requires manual editing to add the AuthInterceptor
```

### 7. Build and Deploy
```bash
# Build frontend
cd frontend
npm run build -- --configuration production

# Restart containers
cd ..
docker-compose down
docker-compose build frontend
docker-compose up -d

# Wait for services
sleep 30
```

### 8. Test Authentication
```bash
# Test login endpoint
curl -X POST https://bitzomax.nl/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Alternative: Automated Deployment

If you have the files locally and SSH access, run:

```powershell
# From Windows PowerShell in the project directory
.\deploy-ssh.ps1 -ServerHost "bitzomax.nl" -Username "root"
```

This will:
- ✅ Check all required files exist
- ✅ Create deployment package
- ✅ Transfer files via SCP
- ✅ Execute deployment script on server
- ✅ Build and restart services
- ✅ Test authentication endpoint

## Quick Fix Commands (If SSH Deployment Fails)

### Fix HTTPS URLs Only
```bash
ssh root@bitzomax.nl
cd /opt/bitzomax/bitzomax-NL
sed -i "s|apiUrl: '/api'|apiUrl: 'https://bitzomax.nl/api'|g" frontend/src/environments/environment.prod.ts
sed -i "s|uploadsUrl: '/api/uploads'|uploadsUrl: 'https://bitzomax.nl/api/uploads'|g" frontend/src/environments/environment.prod.ts
cd frontend && npm run build -- --configuration production
cd .. && docker-compose restart frontend
```

### Test After Changes
```bash
# Check if authentication works
curl -s -o /dev/null -w "%{http_code}" https://bitzomax.nl/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Expected Results
- ✅ Admin login should work: admin/admin123
- ✅ No more mixed content errors in browser console
- ✅ Session persists after page refresh
- ✅ Video upload works for large files
- ✅ Clear error messages for authentication failures

## Rollback (If Something Goes Wrong)
```bash
# Restore from backup
BACKUP_DIR="/opt/bitzomax/backup_YYYYMMDD_HHMMSS"  # Use actual backup directory
cp -r $BACKUP_DIR/* /opt/bitzomax/bitzomax-NL/frontend/src/
cd /opt/bitzomax/bitzomax-NL/frontend
npm run build -- --configuration production
cd .. && docker-compose restart frontend
```

## Troubleshooting

### If deployment fails:
1. Check Docker containers: `docker ps`
2. Check frontend logs: `docker logs bitzomax-nl-frontend-1`
3. Check backend logs: `docker logs bitzomax-nl-backend-1`
4. Verify file permissions: `ls -la frontend/src/environments/`

### If authentication still fails:
1. Check browser console for mixed content errors
2. Test API endpoint directly with curl
3. Verify environment.prod.ts has HTTPS URLs
4. Clear browser cache and localStorage

### Contact Points:
- Check AUTHENTICATION_FIXES.md for detailed troubleshooting
- Use browser developer tools to inspect network requests
- Check server nginx logs for CORS issues
