import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Authentication Route Guard
 * 
 * Protects routes from unauthorized access by verifying user authentication status
 * before allowing navigation to protected components.
 * 
 * Purpose:
 * - Prevent unauthenticated users from accessing protected routes
 * - Redirect unauthorized users to login page
 * - Enforce authentication requirements at the routing level
 * - Works in conjunction with AuthService and HTTP Interceptor
 * 
 * How it Works:
 * 1. Checks if user is authenticated via AuthService.isAuthenticated()
 * 2. If authenticated: Returns true, allowing navigation to proceed
 * 3. If not authenticated: Redirects user to /login and returns false
 * 
 * @returns A boolean indicating whether the route can be activated (true) or not (false).
 *          If false, the user is redirected to the login page.
 * 
 * @example
 * // Usage in routes:\n * // const routes = [\n * //   { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }\n * // ]\n * \n * @see AuthService - Service that provides isAuthenticated() computed signal\n * @see authInterceptor - Automatically adds token to authenticated requests\n * @see LoginComponent - Component where users authenticate\n */
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