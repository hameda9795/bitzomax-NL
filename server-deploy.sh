#!/bin/bash

# BitZomax Authentication Fixes - Server Deployment Commands
# Run these commands on your server via SSH

echo "🚀 Starting BitZomax Authentication Fixes Deployment..."

# Navigate to project directory
cd /opt/bitzomax/bitzomax-NL

# Create backup
echo "💾 Creating backup..."
BACKUP_DIR="/opt/bitzomax/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR
cp -r frontend/src/environments $BACKUP_DIR/
cp -r frontend/src/app/services $BACKUP_DIR/
cp frontend/src/app/app.config.ts $BACKUP_DIR/
echo "✅ Backup created at: $BACKUP_DIR"

# 1. Fix HTTPS environment configuration
echo "🔧 Updating environment.prod.ts for HTTPS..."
cat > frontend/src/environments/environment.prod.ts << 'EOF'
export const environment = {
  production: true,
  apiUrl: 'https://bitzomax.nl/api',
  uploadsUrl: 'https://bitzomax.nl/api/uploads'
};
EOF
echo "✅ Environment configuration updated"

# 2. Create auth interceptor
echo "🔧 Creating auth interceptor..."
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
echo "✅ Auth interceptor created"

# 3. Update app.config.ts to include interceptor
echo "🔧 Updating app.config.ts..."
cat > frontend/src/app/app.config.ts << 'EOF'
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, withFetch, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AuthInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideAnimationsAsync(),
    provideClientHydration(withEventReplay()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
EOF
echo "✅ App config updated with interceptor"

# 4. Build frontend
echo "🔨 Building frontend with production configuration..."
cd frontend
npm run build -- --configuration production

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed! Restoring backup..."
    cp -r $BACKUP_DIR/* frontend/src/
    exit 1
fi

echo "✅ Frontend build successful"

# 5. Restart containers
echo "🐳 Restarting Docker containers..."
cd ..
docker-compose down
docker-compose build frontend
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 30

# 6. Test authentication
echo "🧪 Testing authentication endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" https://bitzomax.nl/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

if [ "$response" = "200" ]; then
    echo "✅ Authentication endpoint is working"
else
    echo "⚠️  Authentication endpoint returned status: $response"
fi

# 7. Check container status
echo "🏥 Checking container health..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🎉 Deployment completed!"
echo "========================"
echo "✅ HTTPS URLs configured"
echo "✅ Auth interceptor added"
echo "✅ Frontend rebuilt"
echo "✅ Containers restarted"
echo ""
echo "📋 Test these now:"
echo "- Login at: https://bitzomax.nl (admin/admin123)"
echo "- Check browser console for mixed content errors (should be none)"
echo "- Test video upload"
echo "- Refresh page and verify session persists"
echo ""
echo "🌐 Application: https://bitzomax.nl"
echo "🔑 Admin login: admin / admin123"
