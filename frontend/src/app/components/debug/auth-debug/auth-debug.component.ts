import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-auth-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="debug-container">
      <div class="debug-header">
        <h2>🔧 Authentication Debug Panel</h2>
        <button class="refresh-btn" (click)="refreshDebugInfo()">🔄 Refresh</button>
      </div>
      
      <div class="debug-section">
        <h3>Environment</h3>
        <div class="debug-item">
          <span class="label">Production:</span>
          <span class="value" [class.success]="!environment.production" [class.warning]="environment.production">
            {{ environment.production }}
          </span>
        </div>
        <div class="debug-item">
          <span class="label">API URL:</span>
          <span class="value">{{ environment.apiUrl }}</span>
        </div>
        <div class="debug-item">
          <span class="label">Uploads URL:</span>
          <span class="value">{{ environment.uploadsUrl }}</span>
        </div>
      </div>

      <div class="debug-section">
        <h3>Authentication State</h3>
        <div class="debug-item">
          <span class="label">Is Authenticated:</span>
          <span class="value" [class.success]="debugInfo.isAuthenticated" [class.error]="!debugInfo.isAuthenticated">
            {{ debugInfo.isAuthenticated }}
          </span>
        </div>
        <div class="debug-item">
          <span class="label">Is Admin:</span>
          <span class="value" [class.success]="debugInfo.isAdmin" [class.error]="!debugInfo.isAdmin">
            {{ debugInfo.isAdmin }}
          </span>
        </div>
        <div class="debug-item">
          <span class="label">Has Token:</span>
          <span class="value" [class.success]="debugInfo.hasToken" [class.error]="!debugInfo.hasToken">
            {{ debugInfo.hasToken }}
          </span>
        </div>
        <div class="debug-item">
          <span class="label">Has User Data:</span>
          <span class="value" [class.success]="debugInfo.hasUser" [class.error]="!debugInfo.hasUser">
            {{ debugInfo.hasUser }}
          </span>
        </div>
        <div class="debug-item">
          <span class="label">Has Valid Session:</span>
          <span class="value" [class.success]="debugInfo.hasValidSession" [class.error]="!debugInfo.hasValidSession">
            {{ debugInfo.hasValidSession }}
          </span>
        </div>
      </div>

      <div class="debug-section">
        <h3>Token Information</h3>
        <div class="debug-item">
          <span class="label">Token Present:</span>
          <span class="value">{{ debugInfo.tokenPresent ? 'Yes' : 'No' }}</span>
        </div>
        <div class="debug-item" *ngIf="debugInfo.tokenPresent">
          <span class="label">Token Length:</span>
          <span class="value">{{ debugInfo.tokenLength }}</span>
        </div>
        <div class="debug-item" *ngIf="debugInfo.tokenPresent">
          <span class="label">Token Preview:</span>
          <span class="value token-preview">{{ debugInfo.tokenPreview }}</span>
        </div>
      </div>

      <div class="debug-section">
        <h3>User Information</h3>
        <div class="debug-item" *ngIf="debugInfo.currentUser">
          <span class="label">Username:</span>
          <span class="value">{{ debugInfo.currentUser.username }}</span>
        </div>
        <div class="debug-item" *ngIf="debugInfo.currentUser">
          <span class="label">Email:</span>
          <span class="value">{{ debugInfo.currentUser.email }}</span>
        </div>
        <div class="debug-item" *ngIf="debugInfo.currentUser">
          <span class="label">Roles:</span>
          <span class="value">{{ debugInfo.currentUser.roles?.join(', ') || 'None' }}</span>
        </div>
        <div class="debug-item" *ngIf="debugInfo.currentUser">
          <span class="label">User ID:</span>
          <span class="value">{{ debugInfo.currentUser.id }}</span>
        </div>
      </div>

      <div class="debug-section">
        <h3>Browser Information</h3>
        <div class="debug-item">
          <span class="label">User Agent:</span>
          <span class="value small">{{ debugInfo.userAgent }}</span>
        </div>
        <div class="debug-item">
          <span class="label">LocalStorage Available:</span>
          <span class="value" [class.success]="debugInfo.localStorageAvailable" [class.error]="!debugInfo.localStorageAvailable">
            {{ debugInfo.localStorageAvailable }}
          </span>
        </div>
        <div class="debug-item">
          <span class="label">Platform:</span>
          <span class="value">{{ debugInfo.platform }}</span>
        </div>
      </div>

      <div class="debug-actions">
        <button class="action-btn refresh" (click)="refreshAuthState()">🔄 Refresh Auth State</button>
        <button class="action-btn clear" (click)="clearAuthData()">🗑️ Clear Auth Data</button>
        <button class="action-btn test" (click)="testAuthEndpoint()">🔬 Test Auth Endpoint</button>
        <button class="action-btn close" (click)="closeDebug()">❌ Close Debug</button>
      </div>

      <div class="debug-section" *ngIf="testResult">
        <h3>Endpoint Test Result</h3>
        <div class="test-result" [class.success]="testResult.success" [class.error]="!testResult.success">
          <div class="test-status">{{ testResult.success ? '✅ Success' : '❌ Failed' }}</div>
          <div class="test-message">{{ testResult.message }}</div>
          <div class="test-details" *ngIf="testResult.details">
            <pre>{{ testResult.details }}</pre>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .debug-container {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      max-height: 80vh;
      overflow-y: auto;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 12px;
      padding: 20px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 12px;
      color: #e2e8f0;
      z-index: 9999;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    }

    .debug-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(99, 102, 241, 0.2);
    }

    .debug-header h2 {
      margin: 0;
      color: #6366f1;
      font-size: 16px;
    }

    .refresh-btn {
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid #6366f1;
      color: #6366f1;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 11px;
    }

    .refresh-btn:hover {
      background: rgba(99, 102, 241, 0.3);
    }

    .debug-section {
      margin-bottom: 20px;
      padding: 15px;
      background: rgba(30, 41, 59, 0.5);
      border-radius: 8px;
      border: 1px solid rgba(71, 85, 105, 0.3);
    }

    .debug-section h3 {
      margin: 0 0 15px 0;
      color: #f1f5f9;
      font-size: 14px;
      font-weight: 600;
    }

    .debug-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding: 4px 0;
    }

    .label {
      color: #94a3b8;
      font-weight: 500;
      min-width: 120px;
    }

    .value {
      color: #e2e8f0;
      text-align: right;
      word-break: break-all;
      max-width: 200px;
    }

    .value.success {
      color: #10b981;
    }

    .value.error {
      color: #ef4444;
    }

    .value.warning {
      color: #f59e0b;
    }

    .value.small {
      font-size: 10px;
    }

    .token-preview {
      font-family: 'Consolas', monospace;
      background: rgba(15, 23, 42, 0.7);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
    }

    .debug-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 20px;
    }

    .action-btn {
      padding: 10px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-size: 11px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .action-btn.refresh {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
      border: 1px solid #22c55e;
    }

    .action-btn.clear {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid #ef4444;
    }

    .action-btn.test {
      background: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
      border: 1px solid #3b82f6;
    }

    .action-btn.close {
      background: rgba(107, 114, 128, 0.2);
      color: #6b7280;
      border: 1px solid #6b7280;
    }

    .action-btn:hover {
      transform: translateY(-1px);
      filter: brightness(1.1);
    }

    .test-result {
      padding: 15px;
      border-radius: 8px;
      margin-top: 10px;
    }

    .test-result.success {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid #22c55e;
    }

    .test-result.error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid #ef4444;
    }

    .test-status {
      font-weight: 600;
      margin-bottom: 8px;
    }

    .test-message {
      margin-bottom: 8px;
    }

    .test-details {
      font-size: 10px;
      overflow-x: auto;
    }

    .test-details pre {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    @media (max-width: 768px) {
      .debug-container {
        position: fixed;
        top: 10px;
        left: 10px;
        right: 10px;
        width: auto;
      }
    }
  `]
})
export class AuthDebugComponent implements OnInit {
  environment = environment;
  debugInfo: any = {};
  testResult: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshDebugInfo();
  }

  refreshDebugInfo(): void {
    const token = this.authService.getToken();
    const currentUser = this.authService.getCurrentUser();

    this.debugInfo = {
      isAuthenticated: this.authService.isAuthenticated(),
      isAdmin: this.authService.isAdmin(),
      hasToken: this.authService.hasToken(),
      hasUser: !!currentUser,
      hasValidSession: this.authService.hasValidSession(),
      tokenPresent: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? `${token.substring(0, 20)}...${token.substring(token.length - 10)}` : 'No token',
      currentUser: currentUser,
      userAgent: navigator.userAgent,
      localStorageAvailable: this.checkLocalStorage(),
      platform: this.getPlatformInfo()
    };
  }

  private checkLocalStorage(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  private getPlatformInfo(): string {
    if (typeof window !== 'undefined') {
      return 'Browser';
    } else {
      return 'Server-side';
    }
  }

  refreshAuthState(): void {
    this.authService.refreshAuthState();
    this.refreshDebugInfo();
  }

  clearAuthData(): void {
    if (confirm('Are you sure you want to clear all authentication data?')) {
      this.authService.logout();
      this.refreshDebugInfo();
    }
  }

  testAuthEndpoint(): void {
    this.testResult = { success: false, message: 'Testing...', details: null };
    
    // Simple endpoint test
    fetch(`${environment.apiUrl}/auth/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.authService.getAuthHeaders()
      }
    })
    .then(response => {
      if (response.ok) {
        this.testResult = {
          success: true,
          message: 'Auth endpoint is reachable',
          details: `Status: ${response.status} ${response.statusText}`
        };
      } else {
        this.testResult = {
          success: false,
          message: 'Auth endpoint returned error',
          details: `Status: ${response.status} ${response.statusText}`
        };
      }
    })
    .catch(error => {
      this.testResult = {
        success: false,
        message: 'Failed to reach auth endpoint',
        details: error.toString()
      };
    });
  }

  closeDebug(): void {
    // You could emit an event or use a service to close this component
    const debugElement = document.querySelector('.debug-container');
    if (debugElement) {
      debugElement.remove();
    }
  }
}
