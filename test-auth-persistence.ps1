# BitzoMax Authentication Persistence Test
# This script will help diagnose the authentication persistence issue

Write-Host "🔧 BitzoMax Authentication Persistence Diagnostic Tool" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Test 1: Verify API is working
Write-Host "`n1. 🌐 Testing API Connectivity..." -ForegroundColor Yellow
try {
    $loginData = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "https://bitzomax.nl/api/auth/signin" -Method POST -Body $loginData -ContentType "application/json"
    
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ API is working correctly" -ForegroundColor Green
        $authResponse = $response.Content | ConvertFrom-Json
        Write-Host "   🔑 Token received: $($authResponse.accessToken.Substring(0,30))..." -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Check if updated code is deployed
Write-Host "`n2. 🚀 Checking if authentication fixes are deployed..." -ForegroundColor Yellow
try {
    $jsContent = Invoke-WebRequest -Uri "https://bitzomax.nl/browser/chunk-FW75LTUB.js" -UseBasicParsing
    
    if ($jsContent.Content -match "checkInitialAuthState") {
        Write-Host "   ✅ Authentication fixes are deployed" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Authentication fixes not found in deployed code" -ForegroundColor Red
    }
    
    if ($jsContent.Content -match "APP_INITIALIZER") {
        Write-Host "   ✅ APP_INITIALIZER is configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ APP_INITIALIZER not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Could not check deployed code: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Generate browser test instructions
Write-Host "`n3. 🧪 Browser Testing Instructions:" -ForegroundColor Yellow
Write-Host "   Follow these steps to test authentication persistence:" -ForegroundColor White

$testSteps = @"
   
   📋 STEP-BY-STEP BROWSER TEST:
   
   1. Open Chrome/Firefox in INCOGNITO/PRIVATE mode
      - This ensures no old cache is affecting the test
   
   2. Navigate to: https://bitzomax.nl
   
   3. Open Developer Tools (F12)
      - Go to Console tab
      - Clear any existing logs
   
   4. Look for these authentication logs on page load:
      🚀 AuthService constructor - Initial state: false
      🔍 Checking initial auth state: {...}
      🔄 initializeAuthState called
      ✅ initializeAuthState completed - Final value: false
   
   5. Login with: admin / admin123
      - Watch console for login logs with emoji icons
      - Should see: 🔐 AuthService.login called with: admin
      - Should see: ✅ Login response received for user: admin
      - Should see: 💾 Token and user saved, logged in state updated to true
   
   6. CRITICAL TEST - Page Refresh:
      - Press F5 to refresh the page
      - Watch console immediately after refresh
      - Look for: 🔍 Checking initial auth state: {hasToken: true, hasUser: true, isAuthenticated: true}
      - Should see: ✅ BehaviorSubject already has correct value: true
   
   7. Verify persistence:
      - After refresh, you should still be logged in
      - Navigation should show "Profiel" and "Uitloggen" buttons
      - If you see "Inloggen" instead, the persistence failed
   
   🔍 DEBUGGING HINTS:
   - If console shows "Server-side rendering" messages, wait for client-side hydration
   - Look for any localStorage errors or warnings
   - Check if token and user data are in localStorage (Application tab -> Local Storage)
   - If authentication state shows false after refresh, check the exact console logs
"@

Write-Host $testSteps -ForegroundColor White

# Test 4: Check server status
Write-Host "`n4. 🖥️ Server Status Check:" -ForegroundColor Yellow
try {
    $indexResponse = Invoke-WebRequest -Uri "https://bitzomax.nl" -UseBasicParsing
    if ($indexResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Website is accessible" -ForegroundColor Green
        
        # Check if the main JS file contains our fixes
        if ($indexResponse.Content -match "chunk-FW75LTUB\.js") {
            Write-Host "   ✅ Main page references updated JavaScript" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "   ❌ Website accessibility error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 EXPECTED RESULT:" -ForegroundColor Cyan
Write-Host "   After login and page refresh, you should remain logged in." -ForegroundColor White
Write-Host "   If the issue persists, check browser console for specific error messages." -ForegroundColor White

Write-Host "`n📞 QUICK TROUBLESHOOTING:" -ForegroundColor Yellow
Write-Host "   - Try hard refresh: Ctrl+F5 or Ctrl+Shift+R" -ForegroundColor White
Write-Host "   - Clear browser cache completely" -ForegroundColor White
Write-Host "   - Test in different browsers (Chrome, Firefox, Edge)" -ForegroundColor White
Write-Host "   - Check if localStorage is enabled in browser settings" -ForegroundColor White

Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "🔧 Diagnostic completed. Please run the browser test above." -ForegroundColor Cyan
