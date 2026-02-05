import { Component } from '@angular/core';

/**
 * Dashboard Component
 * 
 * This component displays the main dashboard view that is only accessible to authenticated users.
 * It is protected by the authGuard route guard in the route configuration,
 * ensuring only logged-in users can access it.
 * 
 * Purpose:
 * - Serves as the primary interface for authenticated users after successful login
 * - Users are automatically redirected here from the login component upon successful authentication
 * - If an unauthenticated user tries to access this route, authGuard redirects them to /login
 * 
 * Access Requirements:
 * - User must be authenticated (valid JWT token in localStorage)
 * - AuthGuard validation must pass (isAuthenticated() must return true)
 * 
 * @component
 * Selector: app-dashboard.component
 * Template: dashboard.component.html
 * Styles: dashboard.component.css
 * Imports: None (currently)
 * 
 * @example
 * // Route configuration in app.routes.ts:
 * // { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
 * 
 * // Navigate to dashboard after login:
 * // this.router.navigate(['/dashboard']);
 * 
 * // Access this component via URL:
 * // http://localhost:4200/dashboard
 * // (Only accessible after successful login)
 * 
 * @see authGuard - Route protection guard in core/guards that protects this component
 * @see LoginComponent - Component that redirects to this dashboard after successful login
 * @see AuthService - Service that manages authentication state
 */
@Component({
  selector: 'app-dashboard.component',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  /**
   * Constructor for DashboardComponent.
   * 
   * Future enhancements:
   * - Inject AuthService to display authenticated user information
   * - Inject UserService to fetch and display user-specific data
   * - Inject other services as needed for dashboard functionality
   * 
   * @example
   * constructor(private authService: AuthService) {}
   */
}
