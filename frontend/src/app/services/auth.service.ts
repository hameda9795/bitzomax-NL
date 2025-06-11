import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, delay } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private loggedIn: BehaviorSubject<boolean>;
  private isInitialized = false;
  private stateCheckInterval?: any;  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loggedIn = new BehaviorSubject<boolean>(false);
    
    console.log('🚀 AuthService constructor');
    
    if (isPlatformBrowser(this.platformId)) {
      // Check initial state immediately
      const initialState = this.getInitialAuthState();
      console.log('🔍 Initial auth state:', initialState);
      
      if (initialState) {
        this.loggedIn.next(true);
        console.log('✅ Setting initial state to true');
      }
      
      // Initialize properly after a brief delay
      setTimeout(() => this.initializeAuthState(), 10);
    }
  }

  private performMultipleInitializationAttempts(): void {
    // مرحله 1: initialization فوری
    setTimeout(() => {
      console.log('🔄 Phase 1: Quick initialization');
      this.initializeAuthState();
    }, 50);

    // مرحله 2: initialization معمولی
    setTimeout(() => {
      console.log('🔄 Phase 2: Standard initialization');
      this.initializeAuthState();
      this.startStateMonitoring();
    }, 100);

    // مرحله 3: initialization دیرتر برای مطمئن شدن
    setTimeout(() => {
      console.log('🔄 Phase 3: Final verification');
      this.ensureInitialized();
    }, 500);

    // مرحله 4: بررسی بعد از DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('🔄 Phase 4: DOM Ready check');
        setTimeout(() => this.ensureInitialized(), 100);
      });
    } else {
      setTimeout(() => {
        console.log('🔄 Phase 4: DOM Already Ready check');
        this.ensureInitialized();
      }, 200);
    }
  }

  private startStateMonitoring(): void {
    // Check auth state every 5 seconds to ensure UI stays in sync
    this.stateCheckInterval = setInterval(() => {
      const currentState = this.loggedIn.value;
      const actualState = this.isAuthenticated();
      
      if (currentState !== actualState) {
        console.log('🔍 State drift detected! Correcting:', { currentState, actualState });
        this.loggedIn.next(actualState);
      }
    }, 5000);
  }

  private getInitialAuthState(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const token = window.localStorage.getItem(TOKEN_KEY);
        const user = window.localStorage.getItem(USER_KEY);
        const isAuthenticated = !!(token && user);
        
        console.log('🔍 Getting initial auth state:', {
          hasToken: !!token,
          hasUser: !!user,
          isAuthenticated,
          tokenPreview: token ? token.substring(0, 30) + '...' : 'not found',
          userPreview: user ? 'exists' : 'not found'
        });
        
        return isAuthenticated;
      } catch (error) {
        console.warn('⚠️ Error checking localStorage:', error);
        return false;
      }
    }
    
    console.log('🖥️ Server-side rendering - returning false');
    return false;
  }  private initializeAuthState(): void {
    if (this.isInitialized) {
      console.log('⚠️ Auth service already initialized, skipping');
      return;
    }

    console.log('🔄 initializeAuthState called');
    
    if (isPlatformBrowser(this.platformId)) {
      try {
        const hasValidToken = this.hasToken();
        const hasValidUser = !!this.getUser();
        const isAuthenticated = hasValidToken && hasValidUser;
        
        console.log('🔍 Full auth state check:', {
          hasValidToken,
          hasValidUser,
          isAuthenticated,
          currentBehaviorSubjectValue: this.loggedIn.value
        });
        
        // تنها در صورتی که وضعیت تغییر کرده باشد، آپدیت کن
        if (this.loggedIn.value !== isAuthenticated) {
          console.log('🔄 Updating BehaviorSubject from', this.loggedIn.value, 'to', isAuthenticated);
          this.loggedIn.next(isAuthenticated);
        } else {
          console.log('✅ BehaviorSubject already has correct value:', isAuthenticated);
        }
        
        // پاکسازی داده‌های ناکامل
        if (hasValidToken && !hasValidUser) {
          console.warn('⚠️ Found token but no user data, clearing localStorage');
          this.clearAuthData();
        } else if (!hasValidToken && hasValidUser) {
          console.warn('⚠️ Found user data but no token, clearing localStorage');
          this.clearAuthData();
        }

        this.isInitialized = true;
      } catch (error) {
        console.error('❌ Error during auth initialization:', error);
        this.clearAuthData();
      }
    } else {
      console.log('🖥️ Server-side rendering - setting to false');
      this.loggedIn.next(false);
    }
    
    console.log('✅ initializeAuthState completed - Final value:', this.loggedIn.value);
  }  private clearAuthData(): void {
    console.log('🗑️ Clearing authentication data');
    if (isPlatformBrowser(this.platformId)) {
      try {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
      } catch (error) {
        console.warn('⚠️ Error clearing localStorage:', error);
      }
    }
    this.loggedIn.next(false);
    this.isInitialized = false;
    
    // Stop state monitoring if clearing auth data
    if (this.stateCheckInterval) {
      clearInterval(this.stateCheckInterval);
    }
  }login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('🔐 AuthService.login called with:', credentials.username);
    console.log('📡 API URL:', `${this.apiUrl}/signin`);
      return this.http.post<AuthResponse>(`${this.apiUrl}/signin`, credentials)
      .pipe(
        tap(response => {
          console.log('✅ Login response received for user:', response.username);
          this.saveToken(response.accessToken);
          this.saveUser(response);
          this.loggedIn.next(true);
          this.isInitialized = true;
          console.log('💾 Token and user saved, logged in state updated to true');
          
          // Restart state monitoring after successful login
          if (this.stateCheckInterval) {
            clearInterval(this.stateCheckInterval);
          }
          this.startStateMonitoring();
        })
      );
  }

  register(userData: SignupRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }  logout(): void {
    console.log('🚪 Logging out user');
    this.clearAuthData();
    
    // Restart state monitoring after logout
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.startStateMonitoring();
      }, 100);
    }
  }saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.setItem(TOKEN_KEY, token);
        console.log('💾 Token saved to localStorage');
      } catch (error) {
        console.error('❌ Error saving token:', error);
      }
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      try {
        return window.localStorage.getItem(TOKEN_KEY);
      } catch (error) {
        console.warn('⚠️ Error getting token:', error);
        return null;
      }
    }
    return null;
  }  saveUser(user: any): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        window.localStorage.removeItem(USER_KEY);
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
        console.log('💾 User data saved to localStorage');
      } catch (error) {
        console.error('❌ Error saving user:', error);
      }
    }
  }

  getUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const user = window.localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
      } catch (error) {
        console.warn('⚠️ Error getting user:', error);
        return null;
      }
    }
    return null;
  }
  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }
  isAuthenticated(): boolean {
    const hasValidToken = this.hasToken();
    const hasValidUser = !!this.getUser();
    return hasValidToken && hasValidUser;
  }

  getCurrentUser(): any {
    return this.getUser();
  }

  hasToken(): boolean {
    const token = this.getToken();
    return !!token && token.length > 0;
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user && user.roles && user.roles.includes('ROLE_ADMIN');
  }  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      console.warn('⚠️ No authentication token found');
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }  // Method to manually refresh authentication state (useful for debugging)
  refreshAuthState(): void {
    console.log('🔄 Manually refreshing authentication state');
    this.isInitialized = false;
    
    // Force immediate state check and update
    if (isPlatformBrowser(this.platformId)) {
      const hasValidToken = this.hasToken();
      const hasValidUser = !!this.getUser();
      const isAuthenticated = hasValidToken && hasValidUser;
      
      console.log('🔍 Forced auth state refresh:', {
        hasValidToken,
        hasValidUser,
        isAuthenticated,
        currentBehaviorSubjectValue: this.loggedIn.value
      });
      
      // Immediately update BehaviorSubject
      if (this.loggedIn.value !== isAuthenticated) {
        console.log('🔄 Force updating BehaviorSubject from', this.loggedIn.value, 'to', isAuthenticated);
        this.loggedIn.next(isAuthenticated);
      }
    }
    
    // Also call regular initialization
    this.initializeAuthState();
  }

  // Method to check if user has valid session
  hasValidSession(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    
    if (!token || !user) {
      return false;
    }

    // Additional validation could be added here (e.g., token expiry check)
    return true;
  }

  // Method to get current authentication state synchronously
  getCurrentAuthState(): boolean {
    return this.loggedIn.value;
  }

  // Method to force logout and clear all authentication data
  forceLogout(): void {
    console.log('🚨 Forcing logout and clearing all auth data');
    this.clearAuthData();
  }  // Method to ensure auth state is properly initialized (call this after app bootstrap)
  ensureInitialized(): void {
    console.log('🔧 ensureInitialized called');
    
    if (isPlatformBrowser(this.platformId)) {
      const currentAuthState = this.isAuthenticated();
      const behaviorSubjectState = this.loggedIn.value;
      
      console.log('🔍 State comparison:', {
        currentAuthState,
        behaviorSubjectState,
        needsUpdate: currentAuthState !== behaviorSubjectState,
        hasToken: this.hasToken(),
        hasUser: !!this.getUser(),
        isInitialized: this.isInitialized
      });
      
      // Multiple verification attempts
      if (currentAuthState !== behaviorSubjectState) {
        console.log('🔄 Correcting BehaviorSubject state from', behaviorSubjectState, 'to', currentAuthState);
        this.loggedIn.next(currentAuthState);
        
        // Force emit to ensure subscribers get the update
        setTimeout(() => {
          if (this.loggedIn.value !== currentAuthState) {
            console.log('🔄 Second attempt: force correcting state');
            this.loggedIn.next(currentAuthState);
          }
        }, 50);
      }
      
      if (!this.isInitialized) {
        console.log('🔧 Running full initialization');
        this.initializeAuthState();
      }
      
      // Triple-check after a short delay
      setTimeout(() => {
        const finalCheck = this.isAuthenticated();
        if (this.loggedIn.value !== finalCheck) {
          console.log('🔄 Final correction attempt');
          this.loggedIn.next(finalCheck);
        }
      }, 100);
    }
  }
  // Force state update method to ensure UI synchronization
  forceStateUpdate(): void {
    console.log('🚀 FORCE STATE UPDATE called');
    const currentState = this.isAuthenticated();
    const behaviorSubjectState = this.loggedIn.value;
    
    console.log('🚀 Force update comparison:', {
      currentState,
      behaviorSubjectState,
      forcingUpdate: currentState !== behaviorSubjectState
    });
    
    // Force emit current state regardless
    this.loggedIn.next(currentState);
    
    // Also force emit after a tiny delay to ensure UI gets it
    setTimeout(() => {
      this.loggedIn.next(currentState);
    }, 10);
  }

  // EMERGENCY SYNCHRONOUS STATE SYNC
  emergencySync(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    console.log('🚨 EMERGENCY SYNC - Immediate localStorage check and state correction');
    
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const user = localStorage.getItem(USER_KEY);
      const shouldBeAuthenticated = !!(token && user);
      
      console.log('🚨 Emergency sync data:', {
        hasToken: !!token,
        hasUser: !!user,
        shouldBeAuthenticated,
        currentBehaviorState: this.loggedIn.value,
        needsEmergencyUpdate: shouldBeAuthenticated !== this.loggedIn.value
      });
      
      if (shouldBeAuthenticated !== this.loggedIn.value) {
        console.log('🚨 EMERGENCY STATE CORRECTION!');
        // Multiple immediate emissions
        this.loggedIn.next(shouldBeAuthenticated);
        setTimeout(() => this.loggedIn.next(shouldBeAuthenticated), 0);
        setTimeout(() => this.loggedIn.next(shouldBeAuthenticated), 1);
        setTimeout(() => this.loggedIn.next(shouldBeAuthenticated), 5);
        setTimeout(() => this.loggedIn.next(shouldBeAuthenticated), 10);
      }
      
      // Force initialization flag
      this.isInitialized = shouldBeAuthenticated;
      
    } catch (error) {
      console.error('🚨 Emergency sync error:', error);
      this.loggedIn.next(false);
    }
  }

  // ULTIMATE localStorage persistence check
  verifyLocalStoragePersistence(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const user = localStorage.getItem(USER_KEY);
      
      console.log('🔍 Verifying localStorage persistence:', {
        hasToken: !!token,
        hasUser: !!user,
        tokenLength: token?.length || 0,
        userLength: user?.length || 0
      });

      // If we have both, verify they're valid
      if (token && user) {
        try {
          JSON.parse(user);
          console.log('✅ localStorage data is valid and persistent');
          return true;
        } catch (e) {
          console.error('❌ User data is corrupted, clearing');
          this.clearAuthData();
          return false;
        }
      }

      console.log('❌ Missing required localStorage data');
      return false;
    } catch (error) {
      console.error('❌ Error verifying localStorage:', error);
      return false;
    }
  }

  // Enhanced refresh method with localStorage verification
  refreshAuthStateUltimate(): void {
    console.log('🔄 ULTIMATE refresh auth state');
    
    const isValid = this.verifyLocalStoragePersistence();
    const currentBehaviorState = this.loggedIn.value;
    
    console.log('🔄 Ultimate refresh comparison:', {
      localStorageValid: isValid,
      currentBehaviorState,
      needsUpdate: isValid !== currentBehaviorState
    });

    if (isValid !== currentBehaviorState) {
      console.log('🔥 ULTIMATE STATE CORRECTION!');
      this.loggedIn.next(isValid);
      
      // Force multiple emissions to ensure UI updates
      setTimeout(() => this.loggedIn.next(isValid), 25);
      setTimeout(() => this.loggedIn.next(isValid), 50);
      setTimeout(() => this.loggedIn.next(isValid), 100);
    }
  }
}
