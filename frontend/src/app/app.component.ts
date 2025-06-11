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
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  private authSubscription?: Subscription;
  private refreshCheckInterval?: any;  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    // Initialize with default values
    this.isLoggedIn = false;
    this.isAdmin = false;
    
    // Initial sync for browser environment
    if (typeof window !== 'undefined') {
      console.log('🚀 AppComponent constructor - Initializing auth state');
      this.emergencyAuthSync();
    }
  }ngOnInit() {
    console.log('🚀 AppComponent ngOnInit - Setting up auth state monitoring');
    
    // Immediate auth state sync
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
    
    // Ensure auth service is initialized
    if (typeof window !== 'undefined') {
      this.authService.ensureInitialized();
      
      // Additional check after a short delay
      setTimeout(() => {
        this.emergencyAuthSync();
      }, 100);
      
      // Listen for storage changes from other tabs
      window.addEventListener('storage', (e) => {
        if (e.key === 'auth-token' || e.key === 'auth-user') {
          console.log('🔄 Storage changed from another tab, syncing');
          this.emergencyAuthSync();
        }
      });
    }
  }  private emergencyAuthSync() {
    if (typeof window === 'undefined') return;
    
    console.log('🔄 Auth sync - checking localStorage');
    const token = localStorage.getItem('auth-token');
    const userStr = localStorage.getItem('auth-user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const shouldBeLoggedIn = true;
        const shouldBeAdmin = (user.roles && user.roles.includes('ROLE_ADMIN')) || 
                             user.admin === true || 
                             user.role === 'ADMIN';
        
        console.log('🔍 Auth sync found valid data:', { 
          shouldBeLoggedIn, 
          shouldBeAdmin, 
          currentState: { isLoggedIn: this.isLoggedIn, isAdmin: this.isAdmin }
        });
        
        if (this.isLoggedIn !== shouldBeLoggedIn || this.isAdmin !== shouldBeAdmin) {
          console.log('🔄 Updating auth state');
          this.ngZone.run(() => {
            this.isLoggedIn = shouldBeLoggedIn;
            this.isAdmin = shouldBeAdmin;
            this.cdr.detectChanges();
          });
        }
      } catch (e) {
        console.error('❌ Error parsing user data:', e);
        this.ngZone.run(() => {
          this.isLoggedIn = false;
          this.isAdmin = false;
          this.cdr.detectChanges();
        });
      }
    } else {
      if (this.isLoggedIn) {
        console.log('🔄 No auth data found, logging out');
        this.ngZone.run(() => {
          this.isLoggedIn = false;
          this.isAdmin = false;
          this.cdr.detectChanges();
        });
      } else {
        // Ensure defaults are set even if no auth data
        this.isLoggedIn = false;
        this.isAdmin = false;
      }
    }
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
