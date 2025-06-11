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
    console.log('🚀 AppComponent constructor - Initializing auth state');
    
    // Always initialize with default values
    this.isLoggedIn = false;
    this.isAdmin = false;
    
    // Initial sync for browser environment with safe guard
    if (typeof window !== 'undefined') {
      try {
        console.log('🚀 Initial auth sync from constructor');
        this.emergencyAuthSync();
      } catch (error) {
        console.error('❌ Error during initial auth sync:', error);
        // Ensure defaults are set
        this.isLoggedIn = false;
        this.isAdmin = false;
      }
    }
  }ngOnInit() {
    console.log('🚀 AppComponent ngOnInit - Setting up auth state monitoring');
    
    try {
      // Always ensure authentication service is initialized first
      if (typeof window !== 'undefined' && this.authService) {
        this.authService.ensureInitialized();
      }
      
      // Immediate auth state sync with error handling
      try {
        this.emergencyAuthSync();
      } catch (error) {
        console.error('❌ Error during emergencyAuthSync:', error);
        // Ensure defaults in case of error
        this.isLoggedIn = false;
        this.isAdmin = false;
        this.cdr.detectChanges();
      }
      
      // Subscribe to authentication state changes with safeguards
      if (this.authService) {
        this.authSubscription = this.authService.isLoggedIn().subscribe(loggedIn => {
          console.log('🔄 Auth state changed in AppComponent:', loggedIn);
          this.ngZone.run(() => {
            // Explicitly set boolean values to avoid type issues
            this.isLoggedIn = loggedIn === true;
            
            if (loggedIn === true) {
              try {
                // Safe call to isAdmin with null check
                this.isAdmin = this.authService && this.authService.isAdmin() === true;
                console.log('✅ User is logged in, isAdmin:', this.isAdmin);
              } catch (error) {
                console.error('❌ Error checking admin status:', error);
                this.isAdmin = false;
              }
            } else {
              this.isAdmin = false;
              console.log('❌ User is not logged in');
            }
            
            // Force change detection
            this.cdr.detectChanges();
          });
        });
      }
      
      // Additional checks and storage event listeners
      if (typeof window !== 'undefined') {
        // Use multiple sync attempts to ensure state consistency
        setTimeout(() => {
          try {
            this.emergencyAuthSync();
          } catch (error) {
            console.error('❌ Error during delayed sync:', error);
          }
        }, 100);
        
        setTimeout(() => {
          try {
            this.emergencyAuthSync();
          } catch (error) {
            console.error('❌ Error during final sync:', error);
          }
        }, 500);
        
        // Listen for storage changes from other tabs
        window.addEventListener('storage', (e) => {
          if (e.key === 'auth-token' || e.key === 'auth-user') {
            console.log('🔄 Storage changed from another tab, syncing');
            try {
              this.emergencyAuthSync();
            } catch (error) {
              console.error('❌ Error during storage event sync:', error);
            }
          }
        });
      }
    } catch (error) {
      console.error('❌ Critical error in ngOnInit:', error);
      // Ensure defaults in case of critical error
      this.isLoggedIn = false;
      this.isAdmin = false;
      this.cdr.detectChanges();
    }
  }private emergencyAuthSync() {
    if (typeof window === 'undefined') return;
    
    console.log('🔄 Auth sync - checking localStorage');
    
    // Ensure default values are always set
    this.isLoggedIn = this.isLoggedIn !== undefined ? this.isLoggedIn : false;
    this.isAdmin = this.isAdmin !== undefined ? this.isAdmin : false;
    
    try {
      const token = localStorage.getItem('auth-token');
      const userStr = localStorage.getItem('auth-user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          // Ensure user object is valid
          if (user && typeof user === 'object') {
            const shouldBeLoggedIn = true;
            const shouldBeAdmin = (user.roles && Array.isArray(user.roles) && user.roles.includes('ROLE_ADMIN')) || 
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
          } else {
            throw new Error('User data structure invalid');
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
          // Always ensure defaults are set
          this.ngZone.run(() => {
            this.isLoggedIn = false;
            this.isAdmin = false;
          });
        }
      }
    } catch (error) {
      console.error('❌ Critical error in auth sync:', error);
      this.ngZone.run(() => {
        this.isLoggedIn = false;
        this.isAdmin = false;
        this.cdr.detectChanges();
      });
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
    try {
      // Safely call logout with null check
      if (this.authService) {
        this.authService.logout();
      }
      
      // Always update local state
      this.ngZone.run(() => {
        this.isLoggedIn = false;
        this.isAdmin = false;
        
        // Force UI update
        this.cdr.detectChanges();
        
        console.log('✅ Logout completed successfully');
      });
    } catch (error) {
      console.error('❌ Error during logout:', error);
      
      // Ensure state is reset even on error
      this.ngZone.run(() => {
        this.isLoggedIn = false;
        this.isAdmin = false;
        this.cdr.detectChanges();
      });
    }
  }
}
