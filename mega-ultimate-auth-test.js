// MEGA-ULTIMATE Authentication Test Script
// Copy and paste this into browser console after login and refresh

console.log("🔥 MEGA-ULTIMATE Auth Test Started");
console.log("=".repeat(60));

// Test 1: Check localStorage data
console.log("📊 Test 1: localStorage Check");
const token = localStorage.getItem('auth-token');
const user = localStorage.getItem('auth-user');
console.log("🔑 Auth Token:", token ? "✅ EXISTS" : "❌ MISSING");
console.log("👤 User Data:", user ? "✅ EXISTS" : "❌ MISSING");

if (token) {
  console.log("📏 Token Length:", token.length, "characters");
  console.log("🔍 Token Preview:", token.substring(0, 20) + "...");
}

if (user) {
  try {
    const userData = JSON.parse(user);
    console.log("👤 User Info:", {
      username: userData.username,
      isAdmin: userData.roles?.includes('ROLE_ADMIN') || userData.admin,
      roles: userData.roles
    });
  } catch (e) {
    console.log("❌ User data parse error:", e);
  }
}

// Test 2: Check UI state
console.log("\n📊 Test 2: UI State Check");
setTimeout(() => {
  const profileBtn = document.querySelector('a[href="/profile"]') || 
                   document.querySelector('button:contains("Profiel")') ||
                   document.querySelector('[routerLink="/profile"]');
  
  const loginBtn = document.querySelector('a[href="/login"]') || 
                  document.querySelector('button:contains("Inloggen")') ||
                  document.querySelector('[routerLink="/login"]');
  
  const logoutBtn = document.querySelector('button:contains("Uitloggen")') ||
                   document.querySelector('a:contains("Uitloggen")');

  console.log("🎯 Profile Button:", profileBtn ? "✅ VISIBLE" : "❌ HIDDEN");
  console.log("🚪 Login Button:", loginBtn ? "❌ VISIBLE (BAD)" : "✅ HIDDEN (GOOD)");
  console.log("🚪 Logout Button:", logoutBtn ? "✅ VISIBLE" : "❌ HIDDEN");

  // Test 3: Calculate authentication state
  console.log("\n📊 Test 3: Authentication State Analysis");
  const hasAuthData = !!(token && user);
  const showsAuthenticatedUI = !!(profileBtn && !loginBtn);
  
  console.log("🔐 Has Auth Data:", hasAuthData ? "✅ YES" : "❌ NO");
  console.log("🖥️ Shows Authenticated UI:", showsAuthenticatedUI ? "✅ YES" : "❌ NO");
  console.log("🔄 States Match:", hasAuthData === showsAuthenticatedUI ? "✅ SYNCHRONIZED" : "❌ MISMATCH");

  // Final verdict
  console.log("\n" + "=".repeat(60));
  if (hasAuthData && showsAuthenticatedUI) {
    console.log("🎉 MEGA-ULTIMATE FIX SUCCESS!");
    console.log("✅ Authentication persisted correctly after refresh!");
    console.log("✅ UI shows correct authenticated state!");
    console.log("✅ Ready to access protected content!");
  } else if (hasAuthData && !showsAuthenticatedUI) {
    console.log("⚠️ PARTIAL SUCCESS - DATA EXISTS BUT UI NOT UPDATED");
    console.log("🔧 The localStorage has auth data but UI hasn't updated yet");
    console.log("💡 Try waiting a few more seconds or refreshing once more");
  } else if (!hasAuthData) {
    console.log("❌ NOT AUTHENTICATED");
    console.log("🔍 Please login first, then refresh and run this test");
  } else {
    console.log("🤔 UNEXPECTED STATE");
    console.log("🔧 Please report this state to the developer");
  }

  // Test 4: Monitor for changes
  console.log("\n📊 Test 4: Monitoring for state changes (5 seconds)...");
  let changeCount = 0;
  const observer = new MutationObserver(() => {
    changeCount++;
  });

  const header = document.querySelector('header') || document.querySelector('nav');
  if (header) {
    observer.observe(header, { childList: true, subtree: true, attributes: true });
  }

  setTimeout(() => {
    observer.disconnect();
    console.log("🔄 UI Changes Detected:", changeCount);
    console.log("📝 Test Complete - Check results above");
    
    if (changeCount > 0) {
      console.log("💡 UI was updated during monitoring - good sign!");
    }
  }, 5000);

}, 1000);

console.log("\n⏳ Starting tests... Please wait for results...");
