# Authentication & Deployment Issues - Resolution Guide

## Issues Resolved

### 1. Mixed Content HTTPS/HTTP Conflicts
**Problem**: Production environment was using relative paths `/api` instead of HTTPS URLs, causing mixed content errors.

**Fix Applied**:
```typescript
// frontend/src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://bitzomax.nl/api',     // ✅ Fixed: Full HTTPS URL
  uploadsUrl: 'https://bitzomax.nl/api/uploads'  // ✅ Fixed: Full HTTPS URL
};
```

**Before**: Mixed content blocking due to HTTP API calls from HTTPS frontend
**After**: All requests use HTTPS, preventing browser security blocks

### 2. Session Persistence Issues
**Problem**: Authentication state was not properly persisting across page refreshes.

**Fix Applied**:
```typescript
// Enhanced AuthService with proper initialization
private initializeAuthState(): void {
  if (isPlatformBrowser(this.platformId)) {
    const hasValidToken = this.hasToken();
    const hasValidUser = !!this.getUser();
    
    // Set initial state based on localStorage content
    const isAuthenticated = hasValidToken && hasValidUser;
    this.loggedIn.next(isAuthenticated);
    
    // Clear incomplete data if only token or user exists but not both
    if (hasValidToken && !hasValidUser) {
      console.warn('Found token but no user data, clearing localStorage');
      this.clearAuthData();
    } else if (!hasValidToken && hasValidUser) {
      console.warn('Found user data but no token, clearing localStorage');
      this.clearAuthData();
    }
  }
}
```

**Improvements**:
- ✅ Proper initialization on service creation
- ✅ Validation of both token and user data
- ✅ Automatic cleanup of corrupted session data
- ✅ Enhanced authentication state checking

### 3. Authentication Error Handling
**Problem**: 403 and 401 errors were not properly handled, causing confusion.

**Fix Applied**:
```typescript
// New HTTP Interceptor for global error handling
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired or invalid
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          // Forbidden - insufficient permissions
          console.warn('Access forbidden - insufficient permissions');
        }
        return throwError(() => error);
      })
    );
  }
}
```

**Benefits**:
- ✅ Automatic redirect to login on 401 errors
- ✅ Proper session cleanup on authentication failures
- ✅ Centralized error handling
- ✅ Better user experience with clear error messages

### 4. Enhanced Video Upload Error Handling
**Problem**: Video upload failures were not providing clear feedback to users.

**Fix Applied**:
```typescript
// Enhanced error handling in video upload
if (error.status === 403) {
  this.errorMessage = 'Toegang geweigerd. Controleer of je ingelogd bent als admin en probeer opnieuw in te loggen.';
  this.authService.logout();
  setTimeout(() => {
    this.router.navigate(['/login']);
  }, 2000);
} else if (error.status === 413) {
  this.errorMessage = 'Het videobestand is te groot. Probeer een kleiner bestand.';
} else if (error.status === 0) {
  this.errorMessage = 'Kan geen verbinding maken met de server. Controleer je internetverbinding.';
}
```

**Improvements**:
- ✅ Specific error messages for different error types
- ✅ Automatic session cleanup on auth failures
- ✅ User-friendly Dutch error messages
- ✅ File size limit feedback

## New Features Added

### 1. Authentication Debug Component
Created a comprehensive debug panel to troubleshoot authentication issues in production:

**Features**:
- ✅ Real-time authentication state monitoring
- ✅ Environment configuration display
- ✅ Token information and validation
- ✅ User data inspection
- ✅ Browser compatibility checks
- ✅ Auth endpoint connectivity testing
- ✅ Manual session refresh capabilities

**Usage**:
```typescript
// Can be added to any component for debugging
import { AuthDebugComponent } from './components/debug/auth-debug/auth-debug.component';
```

### 2. Enhanced AuthService Methods
Added utility methods for better authentication management:

```typescript
// New methods in AuthService
refreshAuthState(): void          // Manually refresh auth state
hasValidSession(): boolean        // Check session validity
clearAuthData(): void            // Clean session cleanup
```

## Deployment Checklist

### Before Deployment
- [ ] Verify environment.prod.ts has HTTPS URLs
- [ ] Test authentication flow in development
- [ ] Verify file upload size limits in nginx
- [ ] Check CORS configuration for HTTPS origins

### During Deployment
- [ ] Build frontend with production configuration
- [ ] Deploy updated Docker containers
- [ ] Verify nginx HTTPS configuration
- [ ] Test authentication endpoints

### After Deployment Testing
- [ ] Test admin login (admin/admin123)
- [ ] Test user registration
- [ ] Test video upload functionality
- [ ] Test session persistence across page refresh
- [ ] Verify HTTPS mixed content resolution
- [ ] Test large file upload (up to 500MB)

## Troubleshooting Guide

### Issue: "Toegang geweigerd" (Access Denied)
**Symptoms**: 403 errors during video upload or admin operations
**Solutions**:
1. Check authentication state with debug component
2. Clear browser cache and localStorage
3. Re-login as admin user
4. Verify session hasn't expired

### Issue: Session Lost on Page Refresh
**Symptoms**: User has to login again after browser refresh
**Solutions**:
1. Check localStorage for auth-token and auth-user keys
2. Verify both token and user data are present
3. Use debug component to inspect authentication state
4. Clear corrupted session data and re-login

### Issue: Mixed Content Errors
**Symptoms**: Blocked HTTP requests on HTTPS site
**Solutions**:
1. Verify environment.prod.ts uses HTTPS URLs
2. Check browser dev tools for mixed content warnings
3. Ensure all API calls use HTTPS
4. Verify nginx proxy configuration

### Issue: Video Upload Fails with Large Files
**Symptoms**: 413 Request Entity Too Large errors
**Solutions**:
1. Verify nginx client_max_body_size setting
2. Check backend file size limits
3. Ensure proper error message display
4. Test with smaller files first

## Production Environment Variables

### Frontend (environment.prod.ts)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://bitzomax.nl/api',
  uploadsUrl: 'https://bitzomax.nl/api/uploads'
};
```

### Backend (application-prod.properties)
```properties
# File upload limits
spring.servlet.multipart.max-file-size=500MB
spring.servlet.multipart.max-request-size=500MB

# CORS configuration
bitzomax.cors.allowed-origins=https://bitzomax.nl,https://www.bitzomax.nl
```

### Nginx Configuration
```nginx
# File upload size
client_max_body_size 500M;

# CORS headers
add_header Access-Control-Allow-Origin https://bitzomax.nl always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept" always;
```

## Testing Commands

### Test Authentication
```bash
# Test login endpoint
curl -X POST https://bitzomax.nl/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test protected endpoint
curl -X GET https://bitzomax.nl/api/videos/all \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test File Upload
```bash
# Test video upload (requires admin token)
curl -X POST https://bitzomax.nl/api/videos/upload \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Test Video" \
  -F "contentType=FREE" \
  -F "videoFile=@test-video.mp4"
```

## Monitoring & Logs

### Check Authentication Issues
1. Browser Developer Tools → Network Tab
2. Look for 401/403 responses
3. Check request headers for Authorization
4. Verify response CORS headers

### Check File Upload Issues
1. Browser Developer Tools → Network Tab
2. Look for 413 (Too Large) responses
3. Check request Content-Length
4. Verify nginx error logs

### Server-side Debugging
1. Check Spring Boot logs for authentication errors
2. Monitor nginx access/error logs
3. Verify database connectivity
4. Check file system permissions for uploads

## Next Steps

1. **Deploy the fixes** to production environment
2. **Test thoroughly** with the provided checklist
3. **Monitor** authentication and upload functionality
4. **Use debug component** if issues persist
5. **Document** any additional issues found

This comprehensive resolution should address all authentication and deployment issues while providing robust debugging capabilities for future troubleshooting.
