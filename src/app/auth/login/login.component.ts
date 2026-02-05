import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  public isLoading = signal(false); // New signal to track loading state
  
  protected readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  public onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true); // Set loading state to true
      const credentials = this.loginForm.getRawValue();
      this.authService.login(credentials).subscribe({
        next: () => {
          this.isLoading.set(false); // Reset loading state on success  
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading.set(false); // Reset loading state on error 
          console.error('Login failed:', error);
        },
      });
    }
  }
}
