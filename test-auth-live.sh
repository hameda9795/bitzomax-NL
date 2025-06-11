#!/bin/bash

# Clear browser cache and test authentication persistence
echo "🧪 Testing Authentication Persistence on BitzoMax.nl"
echo "================================================="

# Test with curl to ensure API is working
echo "1. Testing API connectivity..."
curl -I https://bitzomax.nl/api/auth/signin

echo -e "\n2. Testing login endpoint..."
curl -X POST https://bitzomax.nl/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -v

echo -e "\n3. Testing if website serves updated JavaScript..."
curl -s https://bitzomax.nl/browser/chunk-FW75LTUB.js | grep -o "checkInitialAuthState" | head -1

echo -e "\n✅ Tests completed. Check the output above."
echo -e "\n📋 Manual browser test steps:"
echo "1. Open https://bitzomax.nl in a new incognito window"
echo "2. Open browser Developer Tools (F12)"
echo "3. Go to Console tab"
echo "4. Login with admin/admin123"
echo "5. Check console for authentication logs with emoji icons"
echo "6. Refresh the page (F5)"
echo "7. Check if you remain logged in"
echo "8. Look for console messages about authentication state"
