import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  isProduction = environment.production;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]], 
      password: ['', [Validators.required]]
    });
    
    // Only add debug functionality in development
    if (!environment.production) {
      // Pre-fill with admin credentials for development
      this.loginForm.patchValue({
        username: 'admin',
        password: 'admin123'
      });
      
      console.log('Login component initialized (development mode)');
      console.log('Form initial state:', {
        valid: this.loginForm.valid,
        errors: this.loginForm.errors,
        value: this.loginForm.value
      });
      
      this.loginForm.markAllAsTouched();
    }
  }
  // Test method to bypass form validation (development only)
  testLogin(): void {
    if (environment.production) {
      console.warn('Test login is disabled in production');
      return;
    }
    
    console.log('Test login called');
    const testCredentials = { username: 'admin', password: 'admin123' };
    
    this.authService.login(testCredentials).subscribe({
      next: (response) => {
        console.log('Test login successful', response);
        alert('Login successful! Check console for details.');
        if (response.roles && response.roles.includes('ROLE_ADMIN')) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (error) => {
        console.error('Test login error:', error);
        alert(`Login failed: ${error.status} - ${error.message}`);
      }
    });
  }
  onSubmit(): void {
    console.log('Form submitted');
    console.log('Form valid:', this.loginForm.valid);
    console.log('Form value:', this.loginForm.value);
    console.log('Form errors:', this.loginForm.errors);
    
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      console.log('Making login request to API...');
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login successful', response);
          // Check if user is admin and redirect accordingly
          if (response.roles && response.roles.includes('ROLE_ADMIN')) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/home']);
          }
        },
        error: (error) => {
          console.error('Login error details:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          this.errorMessage = `Inloggen mislukt: ${error.status ? error.status + ' - ' : ''}${error.error?.message || error.message || 'Controleer je gegevens.'}`;
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      console.log('Form is invalid');
      console.log('Username errors:', this.username?.errors);
      console.log('Password errors:', this.password?.errors);
    }
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
