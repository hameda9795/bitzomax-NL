import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, withFetch, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthService } from './services/auth.service';

// Authentication initializer function
export function initializeAuth(authService: AuthService): () => Promise<void> {
  return () => {
    console.log('APP_INITIALIZER: Starting authentication initialization');
    return new Promise<void>((resolve) => {
      
      // چک چندباره برای اطمینان
      const checkAuth = () => {
        console.log('APP_INITIALIZER: Checking authentication state');
        authService.ensureInitialized();
        
        const authState = authService.isAuthenticated();
        const behaviorState = authService.getCurrentAuthState();
        
        console.log('APP_INITIALIZER: Auth states:', {
          authenticated: authState,
          behaviorSubject: behaviorState,
          synchronized: authState === behaviorState
        });
        
        if (authState !== behaviorState) {
          console.log('APP_INITIALIZER: Synchronizing states');
          // Force synchronization
          setTimeout(() => {
            authService.ensureInitialized();
            resolve();
          }, 100);
        } else {
          console.log('APP_INITIALIZER: Authentication initialization complete');
          resolve();
        }
      };
      
      // اول یکبار فوری چک کن
      checkAuth();
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideAnimationsAsync(),
    provideClientHydration(withEventReplay()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true
    }
  ]
};
