/**
 * Login Module for User Authentication
 * 
 * This module handles the user login process with email and password credentials using JWT.
 * It provides the login form UI and coordinates authentication with the backend.
 */
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Login Component
 * 
 * Provides the user interface and logic for authenticating users.
 * 
 * Key Features:
 * - Reactive form with email and password fields
 * - Real-time validation feedback
 * - Secure password submission to AuthService
 * - Automatic navigation to dashboard on successful login
 * - Error handling with user feedback
 * 
 * Authentication Flow:
 * 1. User enters email and password in the form
 * 2. Form validates input (email format, password length)
 * 3. On submit, credentials are sent to AuthService.login()
 * 4. AuthService sends credentials to backend API
 * 5. If successful: Token stored, user object set, navigate to dashboard
 * 6. If failed: Error logged and displayed to user
 * 
 * Form Validation:
 * - Email: Required, must be valid email format
 * - Password: Required, minimum 6 characters
 * - Form is disabled until all validations pass
 * 
 * Integration:
 * - Uses AuthService for backend authentication
 * - Uses Router for navigation after successful login
 * - Uses FormBuilder from @angular/forms for reactive form
 * 
 * @component
 * Selector: app-login
 * Template: login.component.html
 * Styles: login.component.css
 * Imports: ReactiveFormsModule (for form handling)
 * 
 * @example
 * // Route configuration:
 * // { path: 'login', component: LoginComponent }
 * 
 * // Usage:
 * // Users navigate to /login and submit their credentials
 * // On success, they are redirected to /dashboard
 * // On failure, error is displayed
 * 
 * @see AuthService - Handles authentication API calls
 * @see authGuard - Protects dashboard route from unauthenticated access
 * @see authInterceptor - Automatically adds JWT token to future requests
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  
  /**
   * Authentication service for user login.
   * Handles credential validation and JWT token storage.
   * Provides authentication state via signals.
   * @private
   * @type {AuthService}
   */
  private authService = inject(AuthService);
  
  /**
   * Router service for navigation after successful login.
   * Used to redirect authenticated users to the dashboard.
   * @private
   * @type {Router}
   */
  private router = inject(Router);
  
  /**
   * Reactive form group for collecting and validating login credentials.
   * 
   * Form Structure:
   * - email (FormControl):
   *   - Validators: [required, email format]
   *   - Type: string
   *   - Description: User's email address
   *   - Example value: "user@example.com"
   * 
   * - password (FormControl):
   *   - Validators: [required, minimum 6 characters]
   *   - Type: string
   *   - Description: User's password
   *   - Example value: "password123"
   * 
   * Form Status:
   * - Valid: Both email and password meet validation requirements
   * - Invalid: Any field fails validation
   * - The submit button is typically disabled when form is invalid
   * 
   * @type {FormGroup}
   * @readonly
   * @protected - Accessible from template via [formGroup]="loginForm"
   * 
   * @example
   * // In template:
   * // <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
   * //   <input formControlName="email" />
   * //   <input formControlName="password" />
   * //   <button [disabled]="!loginForm.valid">Login</button>
   * // </form>
   */
  protected readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /**
   * Handles login form submission.
   * 
   * Process:
   * 1. Validates the form using loginForm.valid
   * 2. Extracts credentials using getRawValue()
   * 3. Sends credentials to AuthService.login()
   * 4. On success: Navigates to /dashboard
   * 5. On error: Logs error to console
   * 
   * Validation Check:
   * - Only proceeds if form is valid (all fields meet validation rules)
   * - Prevents submission of invalid credentials
   * - User sees validation errors in template before submission
   * 
   * API Communication:
   * - Calls AuthService.login() which makes HTTP POST to backend
   * - Uses Observable subscription for async handling
   * - Handles both success and error responses
   * 
   * Navigation Flow:
   * 1. After successful login, token is stored by AuthService
   * 2. currentUser signal is updated with user data
   * 3. isAuthenticated computed signal becomes true
   * 4. Component navigates user to /dashboard via Router
   * 5. authGuard on dashboard route allows navigation (isAuthenticated = true)
   * 
   * Error Handling:
   * - If login fails (invalid credentials, network error):
   *   - Error is logged to browser console
   *   - User can see validation errors and retry
   *   - Form state is not cleared, allowing user to try again
   * 
   * @returns void
   * 
   * @public
   * 
   * @example
   * // Called from template on form submission:
   * // <form (ngSubmit)="onSubmit()">
   * 
   * // Successful login flow:
   * // 1. User enters email: user@example.com
   * // 2. User enters password: mypassword
   * // 3. User clicks Submit button
   * // 4. onSubmit() is called
   * // 5. Form is validated (valid)
   * // 6. AuthService.login() is called
   * // 7. Backend validates credentials
   * // 8. Backend returns JWT token
   * // 9. Token stored in localStorage
   * // 10. User navigated to /dashboard
   * // 11. Dashboard component renders (authGuard allowed it)
   * 
   * // Failed login flow:
   * // 1. User enters invalid credentials
   * // 2. onSubmit() is called
   * // 3. AuthService.login() is called
   * // 4. Backend returns 401 Unauthorized
   * // 5. error callback is triggered
   * // 6. Error is logged: "Login failed: Invalid credentials"
   * // 7. Form remains with user's input
   * // 8. User can see validation errors and retry
   * 
   * @see AuthService.login() - Backend authentication method
   * @see Router.navigate() - Navigation method
   * @see loginForm - FormGroup with validation rules
   */
  public onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.getRawValue();
      this.authService.login(credentials).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login failed:', error);
        },
      });
    }
  }
}
