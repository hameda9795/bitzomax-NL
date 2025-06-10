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
  private loggedIn = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize authentication state on service creation
    this.initializeAuthState();
  }

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

  private clearAuthData(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    }
    this.loggedIn.next(false);
  }
  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('AuthService.login called with:', credentials);
    console.log('API URL:', `${this.apiUrl}/signin`);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/signin`, credentials)
      .pipe(
        tap(response => {
          console.log('Login response received:', response);
          this.saveToken(response.accessToken);
          this.saveUser(response);
          this.loggedIn.next(true);
          console.log('Token and user saved, logged in state updated');
        })
      );
  }

  register(userData: SignupRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }  logout(): void {
    this.clearAuthData();
  }

  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.setItem(TOKEN_KEY, token);
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
      console.warn('No authentication token found');
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Method to manually refresh authentication state (useful for debugging)
  refreshAuthState(): void {
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
}
