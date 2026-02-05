import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  // Inject AuthService to check authentication status
  const authService = inject(AuthService);
  
  // Inject Router to handle navigation when access is denied
  const router = inject(Router);

  // Check if user is authenticated
  if (authService.isAuthenticated()) {
    return true;
  } else {
    // Redirect to login page if not authenticated
    router.navigate(['/login']);
    return false;
  }
};