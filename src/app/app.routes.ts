import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './core/guards/auth.guard-guard';
import { DashboardComponent } from './dashboard/dashboard.component';

/**
 * Application routing configuration.
 * 
 * Defines all available routes in the application with their associated components
 * and route guards for protection.
 * 
 * Routes:
 * - /login: Public route for user authentication (LoginComponent)
 *   - No guard required, accessible to all users
 * - /dashboard: Protected route for authenticated users (DashboardComponent)
 *   - Protected by authGuard to prevent unauthorized access
 *   - Redirects to /login if user is not authenticated
 * 
 * @type {Routes}
 * 
 * @example
 * // Access routes via URLs:
 * // http://localhost:4200/login - Displays login form
 * // http://localhost:4200/dashboard - Displays dashboard (requires authentication)
 * 
 * @see authGuard - Route protection guard in core/guards
 * @see LoginComponent - Login authentication component
 * @see DashboardComponent - Protected dashboard component
 */
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard] // Protect this route with authentication guard
  }
];
