import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Bitzomax';
  isLoggedIn = false;
  isAdmin = false;
  private authSubscription?: Subscription;
  private refreshCheckInterval?: any;
  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    // IMMEDIATE SYNC - Before anything else happens
    if (typeof window !== 'undefined') {
      console.log('🚨 CONSTRUCTOR - Emergency auth state sync');
      const hasToken = localStorage.getItem('auth-token');
      const hasUser = localStorage.getItem('auth-user');
      if (hasToken && hasUser) {
        console.log('🚨 EMERGENCY: Found auth data, setting state immediately');
        this.isLoggedIn = true;
        this.isAdmin = hasUser.includes('"admin":true') || hasUser.includes('"role":"admin"');
        
        // Force the auth service to sync immediately
        this.authService.emergencySync();
      }
    }
  }  ngOnInit() {
    console.log('🚀 AppComponent ngOnInit - Setting up MEGA-ULTIMATE auth state monitoring');
    
    // IMMEDIATE - Set state synchronously from localStorage
    this.emergencyAuthSync();
    
    // Subscribe to authentication state changes
    this.authSubscription = this.authService.isLoggedIn().subscribe(loggedIn => {
      console.log('🔄 Auth state changed in AppComponent:', loggedIn);
      this.ngZone.run(() => {
        this.isLoggedIn = loggedIn;
        
        if (loggedIn) {
          this.isAdmin = this.authService.isAdmin();
          console.log('✅ User is logged in, isAdmin:', this.isAdmin);
        } else {
          this.isAdmin = false;
          console.log('❌ User is not logged in');
        }
        
        // Force change detection
        this.cdr.detectChanges();
      });
    });
    
    // Only run browser-specific code in browser
    if (typeof window !== 'undefined') {
      // ترکیب همه چیز با 0 تاخیر
      setTimeout(() => this.megaUltimateAuthCheck(), 0);
      setTimeout(() => this.megaUltimateAuthCheck(), 1);
      setTimeout(() => this.megaUltimateAuthCheck(), 10);
      setTimeout(() => this.megaUltimateAuthCheck(), 25);
      setTimeout(() => this.megaUltimateAuthCheck(), 50);
      setTimeout(() => this.megaUltimateAuthCheck(), 100);
      setTimeout(() => this.megaUltimateAuthCheck(), 200);
      setTimeout(() => this.megaUltimateAuthCheck(), 500);
      
      // بررسی مداوم هر 1 ثانیه برای اول 10 ثانیه
      this.startAggressiveRefreshCheck();
      
      // Listen for page visibility changes
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          console.log('🔍 Page became visible - performing mega ultimate auth check');
          this.emergencyAuthSync();
          setTimeout(() => this.megaUltimateAuthCheck(), 0);
        }
      });
      
      // Listen for storage changes from other tabs
      window.addEventListener('storage', (e) => {
        if (e.key === 'auth-token' || e.key === 'auth-user') {
          console.log('🔄 Storage changed from another tab, emergency sync');
          this.emergencyAuthSync();
          setTimeout(() => this.megaUltimateAuthCheck(), 0);
        }
      });
      
      // NUCLEAR OPTION: Check every 100ms for first 5 seconds
      this.startNuclearOption();
    }
  }
  private emergencyAuthSync() {
    if (typeof window === 'undefined') return;
    
    console.log('🚨 EMERGENCY AUTH SYNC - Immediate localStorage check');
    const token = localStorage.getItem('auth-token');
    const userStr = localStorage.getItem('auth-user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const shouldBeLoggedIn = true;
        const shouldBeAdmin = user.admin === true || user.role === 'admin';
        
        console.log('🚨 Emergency sync found:', { token: !!token, user, shouldBeLoggedIn, shouldBeAdmin });
        
        if (this.isLoggedIn !== shouldBeLoggedIn || this.isAdmin !== shouldBeAdmin) {
          console.log('🚨 EMERGENCY UPDATE NEEDED!');
          this.ngZone.run(() => {
            this.isLoggedIn = shouldBeLoggedIn;
            this.isAdmin = shouldBeAdmin;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          });
        }
      } catch (e) {
        console.error('🚨 Emergency sync error:', e);
      }
    } else {
      if (this.isLoggedIn) {
        console.log('🚨 Emergency sync: No auth data, logging out');
        this.ngZone.run(() => {
          this.isLoggedIn = false;
          this.isAdmin = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        });
      }
    }
  }

  private megaUltimateAuthCheck() {
    if (typeof window === 'undefined') return;
    
    console.log('🔥 MEGA ULTIMATE AUTH CHECK');
    
    // Emergency sync first
    this.emergencyAuthSync();
    
    // Force service sync
    this.authService.emergencySync();
    this.authService.forceStateUpdate();
    
    // Double check everything
    const serviceState = this.authService.isAuthenticated();
    if (serviceState !== this.isLoggedIn) {
      console.log('🔥 SERVICE STATE MISMATCH - FORCING UPDATE');
      this.ngZone.run(() => {
        this.isLoggedIn = serviceState;
        this.isAdmin = serviceState ? this.authService.isAdmin() : false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      });
    }
  }

  private startAggressiveRefreshCheck() {
    if (typeof window === 'undefined') return;
    
    let checkCount = 0;
    const maxChecks = 10; // 10 seconds of aggressive checking
    
    this.refreshCheckInterval = setInterval(() => {
      checkCount++;
      
      if (checkCount <= maxChecks) {
        this.emergencyAuthSync();
        this.megaUltimateAuthCheck();
      } else {
        // After 10 seconds, reduce to every 5 seconds
        clearInterval(this.refreshCheckInterval);
        this.startNormalRefreshCheck();
      }
    }, 1000);
  }

  private startNormalRefreshCheck() {
    if (typeof window === 'undefined') return;
    
    this.refreshCheckInterval = setInterval(() => {
      const hasToken = !!localStorage.getItem('auth-token');
      const hasUser = !!localStorage.getItem('auth-user');
      const shouldBeLoggedIn = hasToken && hasUser;
      
      if (shouldBeLoggedIn !== this.isLoggedIn) {
        console.log('🔄 Normal check found mismatch, correcting...');
        this.megaUltimateAuthCheck();
      }
    }, 5000);
  }

  private startNuclearOption() {
    if (typeof window === 'undefined') return;
    
    console.log('☢️ NUCLEAR OPTION: Ultra-aggressive auth checking for 5 seconds');
    
    let nuclearCount = 0;
    const nuclearInterval = setInterval(() => {
      nuclearCount++;
      
      this.emergencyAuthSync();
      
      if (nuclearCount >= 50) { // 5 seconds * 10 checks per second
        clearInterval(nuclearInterval);
        console.log('☢️ Nuclear option complete');
      }
    }, 100); // Every 100ms for 5 seconds
  }  private ultimateAuthCheck() {
    // Kept for compatibility, but now calls megaUltimateAuthCheck
    this.megaUltimateAuthCheck();
  }

  private startContinuousRefreshCheck() {
    // Kept for compatibility, but now calls startAggressiveRefreshCheck
    this.startAggressiveRefreshCheck();
  }
  
  ngOnDestroy() {
    console.log('🧹 AppComponent cleanup');
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.refreshCheckInterval) {
      clearInterval(this.refreshCheckInterval);
    }
  }

  logout() {
    console.log('👋 User logout requested');
    this.authService.logout();
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.cdr.detectChanges();
  }
}
