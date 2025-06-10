# BitZomax Authentication Testing Script
# Tests all authentication and upload functionality

Write-Host "🧪 BitZomax Authentication Testing Suite" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

$baseUrl = "https://bitzomax.nl"
$apiUrl = "$baseUrl/api"

# Test Results
$testResults = @{}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    Write-Host "🔍 Testing: $Name" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-WebRequest @params
        
        Write-Host "  ✅ SUCCESS: $($response.StatusCode)" -ForegroundColor Green
        $testResults[$Name] = @{
            Status = "PASS"
            StatusCode = $response.StatusCode
            Response = $response
        }
        return $response
    }
    catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode } else { "N/A" }
        Write-Host "  ❌ FAILED: $statusCode - $($_.Exception.Message)" -ForegroundColor Red
        $testResults[$Name] = @{
            Status = "FAIL"
            StatusCode = $statusCode
            Error = $_.Exception.Message
        }
        return $null
    }
}

# Test 1: Basic connectivity
Write-Host ""
Write-Host "📡 Testing Basic Connectivity" -ForegroundColor Cyan
Test-Endpoint -Name "Frontend Homepage" -Url $baseUrl
Test-Endpoint -Name "API Health Check" -Url "$apiUrl/videos/public"

# Test 2: Authentication endpoints
Write-Host ""
Write-Host "🔐 Testing Authentication Endpoints" -ForegroundColor Cyan

# Test login with admin credentials
$loginResponse = Test-Endpoint -Name "Admin Login" -Url "$apiUrl/auth/signin" -Method "POST" `
    -Headers @{"Content-Type" = "application/json"} `
    -Body '{"username":"admin","password":"admin123"}'

$adminToken = $null
if ($loginResponse) {
    try {
        $loginData = $loginResponse.Content | ConvertFrom-Json
        $adminToken = $loginData.accessToken
        Write-Host "  🎫 Admin token obtained: $($adminToken.Substring(0, 20))..." -ForegroundColor Green
    }
    catch {
        Write-Host "  ⚠️  Could not parse login response" -ForegroundColor Yellow
    }
}

# Test login with invalid credentials
Test-Endpoint -Name "Invalid Login" -Url "$apiUrl/auth/signin" -Method "POST" `
    -Headers @{"Content-Type" = "application/json"} `
    -Body '{"username":"invalid","password":"invalid"}'

# Test 3: Protected endpoints
Write-Host ""
Write-Host "🛡️  Testing Protected Endpoints" -ForegroundColor Cyan

if ($adminToken) {
    $authHeaders = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    
    Test-Endpoint -Name "Admin Videos List" -Url "$apiUrl/videos/all" -Headers $authHeaders
    Test-Endpoint -Name "User Management" -Url "$apiUrl/admin/users" -Headers $authHeaders
} else {
    Write-Host "  ⚠️  Skipping protected endpoint tests - no admin token" -ForegroundColor Yellow
}

# Test 4: File upload capability
Write-Host ""
Write-Host "📁 Testing File Upload Capability" -ForegroundColor Cyan

if ($adminToken) {
    # Test upload endpoint without files (should return 400, not 403)
    Test-Endpoint -Name "Upload Endpoint Access" -Url "$apiUrl/videos/upload" -Method "POST" `
        -Headers @{"Authorization" = "Bearer $adminToken"}
} else {
    Write-Host "  ⚠️  Skipping upload tests - no admin token" -ForegroundColor Yellow
}

# Test 5: CORS and HTTPS
Write-Host ""
Write-Host "🌐 Testing CORS and HTTPS" -ForegroundColor Cyan

# Test CORS preflight
Test-Endpoint -Name "CORS Preflight" -Url "$apiUrl/videos/public" -Method "OPTIONS" `
    -Headers @{"Origin" = $baseUrl}

# Test mixed content (should work with HTTPS)
Test-Endpoint -Name "HTTPS API from HTTPS Frontend" -Url "$apiUrl/videos/public" `
    -Headers @{"Referer" = $baseUrl}

# Test 6: Registration
Write-Host ""
Write-Host "👤 Testing User Registration" -ForegroundColor Cyan

$randomUser = "testuser_$(Get-Random -Minimum 1000 -Maximum 9999)"
Test-Endpoint -Name "User Registration" -Url "$apiUrl/auth/signup" -Method "POST" `
    -Headers @{"Content-Type" = "application/json"} `
    -Body "{`"username`":`"$randomUser`",`"email`":`"$randomUser@test.com`",`"password`":`"password123`"}"

# Display results summary
Write-Host ""
Write-Host "📊 Test Results Summary" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

$passCount = 0
$failCount = 0

foreach ($test in $testResults.GetEnumerator()) {
    $status = if ($test.Value.Status -eq "PASS") { "✅" } else { "❌" }
    $statusCode = $test.Value.StatusCode
    
    Write-Host "$status $($test.Key): $statusCode" -ForegroundColor $(if ($test.Value.Status -eq "PASS") { "Green" } else { "Red" })
    
    if ($test.Value.Status -eq "PASS") { $passCount++ } else { $failCount++ }
}

Write-Host ""
Write-Host "Total Tests: $($testResults.Count)" -ForegroundColor Cyan
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red

# Recommendations
Write-Host ""
Write-Host "🔧 Recommendations" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow

if ($failCount -eq 0) {
    Write-Host "🎉 All tests passed! Authentication system is working correctly." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Please check the following:" -ForegroundColor Yellow
    
    if (-not $adminToken) {
        Write-Host "- Admin login failed - check credentials and database" -ForegroundColor White
    }
    
    foreach ($test in $testResults.GetEnumerator()) {
        if ($test.Value.Status -eq "FAIL") {
            Write-Host "- $($test.Key) failed with: $($test.Value.Error)" -ForegroundColor White
        }
    }
}

Write-Host ""
Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "- Test manually in browser: $baseUrl" -ForegroundColor White
Write-Host "- Login as admin: admin / admin123" -ForegroundColor White
Write-Host "- Try uploading a video" -ForegroundColor White
Write-Host "- Check session persistence (refresh page)" -ForegroundColor White
Write-Host "- Use AuthDebugComponent if issues persist" -ForegroundColor White

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
