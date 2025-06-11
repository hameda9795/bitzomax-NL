// اگر مشکل صفحه‌تازه هنوز وجود دارد، این فایل را جایگزین auth.service.ts کنید

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
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

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // تنظیم مقدار اولیه BehaviorSubject بر اساس localStorage
    const initialAuthState = this.checkInitialAuthState();
    this.loggedIn = new BehaviorSubject<boolean>(initialAuthState);
    
    console.log('🚀 AuthService constructor - Initial state:', initialAuthState);
    
    // فراخوانی متد کامل initialization
    this.initializeAuthState();
  }

  private checkInitialAuthState(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = window.localStorage.getItem(TOKEN_KEY);
      const user = window.localStorage.getItem(USER_KEY);
      const isAuthenticated = !!(token && user);
      
      console.log('🔍 Checking initial auth state:', {
        hasToken: !!token,
        hasUser: !!user,
        isAuthenticated,
        tokenPreview: token ? token.substring(0, 30) + '...' : 'not found',
        userPreview: user ? 'exists' : 'not found'
      });
      
      return isAuthenticated;
    }
    
    console.log('🖥️ Server-side rendering - returning false');
    return false;
  }

  private initializeAuthState(): void {
    console.log('🔄 initializeAuthState called');
    
    if (isPlatformBrowser(this.platformId)) {
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
    } else {
      console.log('🖥️ Server-side rendering - setting to false');
      this.loggedIn.next(false);
    }
    
    console.log('✅ initializeAuthState completed - Final value:', this.loggedIn.value);
  }

  private clearAuthData(): void {
    console.log('🗑️ Clearing authentication data');
    if (isPlatformBrowser(this.platformId)) {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    }
    this.loggedIn.next(false);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('🔐 AuthService.login called with:', credentials.username);
    console.log('📡 API URL:', `${this.apiUrl}/signin`);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/signin`, credentials)
      .pipe(
        tap(response => {
          console.log('✅ Login response received for user:', response.username);
          this.saveToken(response.accessToken);
          this.saveUser(response);
          this.loggedIn.next(true);
          console.log('💾 Token and user saved, logged in state updated to true');
        })
      );
  }

  register(userData: SignupRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  logout(): void {
    console.log('🚪 Logging out user');
    this.clearAuthData();
  }

  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.setItem(TOKEN_KEY, token);
      console.log('💾 Token saved to localStorage');
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return window.localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  saveUser(user: any): void {
    if (isPlatformBrowser(this.platformId)) {
      window.localStorage.removeItem(USER_KEY);
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
      console.log('💾 User data saved to localStorage');
    }
  }

  getUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      const user = window.localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
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
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      console.warn('⚠️ No authentication token found');
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Method to manually refresh authentication state (useful for debugging)
  refreshAuthState(): void {
    console.log('🔄 Manually refreshing authentication state');
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
  }
}
