// 🔥 QUICK HEADER PERSISTENCE TEST
// Copy and paste this into browser console after login + refresh

console.log('%c🧪 TESTING HEADER PERSISTENCE AFTER REFRESH', 'color: #00ff00; font-size: 16px; font-weight: bold;');
console.log('='.repeat(50));

// Test 1: Check localStorage
const token = localStorage.getItem('auth-token');
const user = localStorage.getItem('auth-user');
console.log('📦 localStorage Test:');
console.log('  Token exists:', !!token);
console.log('  User exists:', !!user);
console.log('  Both present:', !!(token && user));

// Test 2: Check header elements
const profileLink = document.querySelector('a[routerLink="/profile"]');
const loginLink = document.querySelector('a[routerLink="/login"]');
const logoutBtn = document.querySelector('button.btn-logout, button:contains("Uitloggen")');

console.log('🧭 Header UI Test:');
console.log('  Profile link visible:', !!profileLink);
console.log('  Login link visible:', !!loginLink);
console.log('  Logout button visible:', !!logoutBtn);

// Test 3: Check expected vs actual state
const expectedLoggedIn = !!(token && user);
const headerShowsLoggedIn = !!profileLink && !loginLink;

console.log('🎯 State Comparison:');
console.log('  Expected logged in:', expectedLoggedIn);
console.log('  Header shows logged in:', headerShowsLoggedIn);
console.log('  States match:', expectedLoggedIn === headerShowsLoggedIn);

// Test 4: Overall result
const testPassed = expectedLoggedIn && headerShowsLoggedIn && (expectedLoggedIn === headerShowsLoggedIn);

console.log('='.repeat(50));
if (testPassed) {
    console.log('%c✅ TEST PASSED: Header persistence works correctly!', 'color: #00ff00; font-size: 14px; font-weight: bold;');
    console.log('🎉 You should see Profile and Logout in header');
} else {
    console.log('%c❌ TEST FAILED: Header persistence issue still exists', 'color: #ff0000; font-size: 14px; font-weight: bold;');
    console.log('🔧 Expected: Profile + Logout visible');
    console.log('🔧 Actual: Check header elements above');
}

console.log('='.repeat(50));

// Test 5: Check for state monitoring
setTimeout(() => {
    console.log('⏰ Checking for state monitoring after 3 seconds...');
    console.log('💡 Look for "State drift detected" messages in console');
    console.log('💡 State monitoring should run every 5 seconds');
}, 3000);
