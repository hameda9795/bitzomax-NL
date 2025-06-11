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
  ) {}

  ngOnInit(): void {
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
    
    // Ensure we have a form and valid credentials before proceeding
    if (!this.loginForm || !this.loginForm.value) {
      this.errorMessage = 'Er is een probleem met het formulier. Probeer het opnieuw.';
      return;
    }
    
    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;
    
    if (!username || !password) {
      this.errorMessage = 'Voer uw gebruikersnaam en wachtwoord in.';
      return;
    }
    
    // Set loading state and clear error messages
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('Making login request to API...');
    
    // Create a proper credentials object
    const credentials = {
      username: username,
      password: password
    };
    
    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        // Check if user is admin and redirect accordingly
        if (response && response.roles && Array.isArray(response.roles) && response.roles.includes('ROLE_ADMIN')) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (error) => {
        console.error('Login error details:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        
        // More descriptive error message for users
        if (error.status === 401) {
          this.errorMessage = 'Ongeldige gebruikersnaam of wachtwoord.';
        } else if (error.status === 403) {
          this.errorMessage = 'Je hebt geen toegang tot deze functie.';
        } else {
          this.errorMessage = `Inloggen mislukt: ${error.status ? error.status + ' - ' : ''}${error.error?.message || error.message || 'Controleer je gegevens.'}`;
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
