// Authentication Persistence Test Script
// This script tests if login sessions persist after page refresh

console.log('🔍 AUTHENTICATION PERSISTENCE TEST');
console.log('===================================');

// Function to test localStorage persistence
function testLocalStoragePersistence() {
    console.log('\n📱 Testing localStorage state:');
    
    const token = localStorage.getItem('auth-token');
    const user = localStorage.getItem('auth-user');
    
    console.log('🔑 Token exists:', !!token);
    console.log('👤 User data exists:', !!user);
    
    if (token) {
        console.log('🔑 Token preview:', token.substring(0, 30) + '...');
        console.log('🔑 Token length:', token.length);
    }
    
    if (user) {
        try {
            const userData = JSON.parse(user);
            console.log('👤 User data:', {
                id: userData.id,
                username: userData.username,
                email: userData.email,
                roles: userData.roles
            });
        } catch (e) {
            console.warn('⚠️ Error parsing user data:', e);
        }
    }
    
    return !!(token && user);
}

// Function to test if we can access protected endpoints
async function testProtectedEndpoint() {
    console.log('\n🔒 Testing protected endpoint access:');
    
    const token = localStorage.getItem('auth-token');
    if (!token) {
        console.log('❌ No token found - skipping endpoint test');
        return false;
    }
    
    try {
        const response = await fetch('https://bitzomax.nl/api/messages/my-messages?page=0&size=10', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 API Response status:', response.status);
        console.log('📡 API Response ok:', response.ok);
        
        if (response.ok) {
            console.log('✅ Successfully accessed protected endpoint');
            return true;
        } else {
            console.log('❌ Failed to access protected endpoint');
            return false;
        }
    } catch (error) {
        console.log('❌ Error accessing protected endpoint:', error.message);
        return false;
    }
}

// Function to test AuthService state
function testAuthServiceState() {
    console.log('\n🏗️ Testing AuthService state:');
    
    // Check if Angular is loaded
    if (typeof ng === 'undefined') {
        console.log('⚠️ Angular not yet loaded or in production mode');
        return false;
    }
    
    try {
        // Try to get AuthService from Angular
        const authService = ng.getInjector().get('AuthService');
        if (authService) {
            console.log('✅ AuthService found');
            console.log('🔍 Current auth state:', authService.isLoggedIn());
            return authService.isLoggedIn();
        }
    } catch (error) {
        console.log('⚠️ Could not access AuthService:', error.message);
    }
    
    return false;
}

// Main test function
async function runPersistenceTest() {
    console.log('🚀 Starting authentication persistence test...\n');
    
    const localStorageOk = testLocalStoragePersistence();
    const endpointOk = await testProtectedEndpoint();
    const authServiceOk = testAuthServiceState();
    
    console.log('\n📊 TEST RESULTS:');
    console.log('================');
    console.log('localStorage data:', localStorageOk ? '✅ PASS' : '❌ FAIL');
    console.log('Protected endpoint:', endpointOk ? '✅ PASS' : '❌ FAIL');
    console.log('AuthService state:', authServiceOk ? '✅ PASS' : '⚠️ SKIP');
    
    const overallResult = localStorageOk && endpointOk;
    console.log('\n🎯 OVERALL RESULT:', overallResult ? '✅ AUTHENTICATION PERSISTS' : '❌ AUTHENTICATION LOST');
    
    if (!overallResult) {
        console.log('\n🔧 TROUBLESHOOTING TIPS:');
        console.log('1. Clear browser cache and try again');
        console.log('2. Check browser console for JavaScript errors');
        console.log('3. Verify network connectivity');
        console.log('4. Try logging in again');
    }
    
    return overallResult;
}

// Auto-run the test
runPersistenceTest();

// Also make it available globally for manual testing
window.testAuthPersistence = runPersistenceTest;
window.testLocalStorage = testLocalStoragePersistence;
window.testProtectedEndpoint = testProtectedEndpoint;

console.log('\n💡 Manual testing commands available:');
console.log('- testAuthPersistence() - Run full test');
console.log('- testLocalStorage() - Test localStorage only');
console.log('- testProtectedEndpoint() - Test API access only');
