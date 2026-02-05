import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';

/**
 * Authentication Service
 * 
 * Centralized service for managing user authentication and authorization throughout the application.
 * Handles login/logout operations, manages JWT tokens, maintains current user state, and provides
 * reactive authentication status to components.
 * 
 * Key Responsibilities:
 * - User credential validation and login via HTTP
 * - JWT token storage and retrieval from localStorage
 * - Current user state management using Angular signals
 * - Authentication status computation and observation
 * - Secure logout with token removal
 * - Integration with HTTP interceptor for automatic token attachment
 * 
 * Features:
 * - Reactive user state using Angular signals (performant and type-safe)
 * - Computed authentication status that updates reactively
 * - Centralized token management
 * - Read-only exposure of user data to prevent unauthorized modifications
 * 
 * @Injectable
 * Provided in: 'root' (singleton service - single instance application-wide)
 * 
 * @example
 * // Inject the service in a component:
 * constructor(private authService: AuthService) {}
 * 
 * // Login a user:
 * this.authService.login({ email: 'user@example.com', password: 'pass123' })
 *   .subscribe({
 *     next: response => console.log('Logged in:', response),
 *     error: error => console.error('Login failed:', error)
 *   });
 * 
 * // Check if user is authenticated:
 * if (this.authService.isAuthenticated()) {
 *   // User is currently logged in
 * }
 * 
 * // Access current user information:
 * const user = this.authService.currentUser();
 * if (user) {
 *   console.log('Current user:', user.email, user.name);
 * }
 * 
 * // Logout a user:
 * this.authService.logout();
 * 
 * @see authInterceptor - Automatically attaches JWT tokens from this service to HTTP requests
 * @see authGuard - Uses isAuthenticated() from this service to protect routes
 * @see LoginComponent - Uses this service for user authentication
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /**
   * HTTP client for making API requests.
   * Used to send login credentials to the backend authentication endpoint.
   * @private
   */
  private http: HttpClient;

  /**
   * Private signal holding the current authenticated user object.
   * 
   * State transitions:
   * - Initial state: null (user not logged in)
   * - After successful login: { user object with email, name, etc. }
   * - After logout: null (user logged out)
   * 
   * This signal is marked as private (#) to prevent direct modification.
   * Use logout() method to clear this state.
   * 
   * @type {WritableSignal<any | null>}
   * @private
   */
  #currentUser = signal<any | null>(null);
  
  /**
   * Constructor for AuthService.
   * 
   * Initializes the authentication service with the HTTP client dependency and restores
   * the user's authentication state from localStorage if a valid token exists.
   * 
   * Initialization Process:
   * 1. Stores the injected HttpClient for use in login/logout operations
   * 2. Checks localStorage for an existing JWT token ('token_access')
   * 3. If token exists: Initializes currentUser signal to restore authenticated state
   * 4. If no token: Leaves currentUser as null (user not authenticated)
   * 
   * This ensures that users remain logged in across browser sessions/page refreshes
   * without needing to re-authenticate.
   * 
   * @param {HttpClient} http - Angular HTTP client service
   *   - Dependency injected automatically by Angular
   *   - Used for POST requests to backend authentication endpoints
   *   - Used internally by login() and logout() methods
   * 
   * @remarks
   * - This constructor is called automatically by Angular's dependency injection system
   * - The service is provided at root level, creating a singleton instance
   * - In a production application, you should validate the token or fetch user info from backend
   * - Current implementation stores token in signal; consider token expiration handling
   * 
   * @example
   * // Service instantiation is handled automatically by Angular
   * // Inject in components:
   * constructor(private authService: AuthService) {
   *   // authService is ready to use
   *   // User will be authenticated if a valid token exists
   * }
   * 
   * @see login() - Handles user credential submission and token storage
   * @see logout() - Clears authentication state and removes token
   * @see currentUser - Signal that reflects authentication state
   * @see isAuthenticated - Computed signal derived from currentUser
   */
  constructor(http: HttpClient) {
    this.http = http;
    this.checkAuthStatus();
    
    const token = localStorage.getItem('token_access');
    if (token) {
      // In a real application, you would decode the token or fetch user info from backend
      this.#currentUser.set({ token });
    } 
  }

  private checkAuthStatus() {
    const token = localStorage.getItem('token_access');
    if (token) {
      this.#currentUser.set({ token });
    } else {
      this.#currentUser.set(null);
    }
  }
  
  /**
   * Read-only signal exposing the current authenticated user.
   * 
   * Can be subscribed to in components for reactive updates when user state changes.
   * Returns null when no user is logged in.
   * 
   * @type {Signal<any | null>}
   * @readonly
   * 
   * @example
   * // In component class:
   * user = inject(AuthService).currentUser;
   * 
   * // In template:
   * <div>{{ currentUser()?.email }}</div>
   */
  public readonly currentUser = this.#currentUser.asReadonly();
  
  /**
   * Computed signal that automatically tracks authentication status.
   * 
   * Derives its value from currentUser signal:
   * - Returns true if currentUser is not null (user is logged in)
   * - Returns false if currentUser is null (user is logged out)
   * 
   * This computed signal is highly efficient - it only recalculates when
   * the underlying currentUser signal changes, making it perfect for
   * use in templates and guards.
   * 
   * @type {Signal<boolean>}
   * 
   * @example
   * // In component:
   * if (this.authService.isAuthenticated()) {
   *   // User is logged in
   * }
   * 
   * // In template:
   * <div *ngIf="isAuthenticated()">Welcome, authenticated user!</div>
   * 
   * @see authGuard - Uses this computed signal to determine if route access is allowed
   */
  public isAuthenticated = computed(() => !!this.#currentUser());

  /**
   * Authenticates a user with the provided credentials.
   * 
   * Process:
   * 1. Sends a POST request to the login endpoint with user credentials
   * 2. Backend validates credentials and returns JWT token if valid
   * 3. On success: Stores access token in localStorage and updates currentUser signal
   * 4. The authInterceptor will automatically use this token in subsequent requests
   * 
   * Token Storage:
   * - Token is stored in localStorage under key 'token_access'
   * - This persists across browser sessions
   * - Token is retrieved by authInterceptor for all HTTP requests
   * 
   * Side Effects:
   * - currentUser signal is updated with user object from response
   * - isAuthenticated computed signal automatically becomes true
   * - authGuard will allow navigation to protected routes
   * 
   * Error Handling:
   * - If credentials are invalid, backend returns 401 Unauthorized
   * - If network error occurs, the Observable emits an error
   * - Caller is responsible for handling errors via subscribe error handler
   * 
   * @param credentials - Object containing user login credentials
   *   - email: User's email address (required)
   *   - password: User's password (required)
   * @returns Observable<any> - Emits the login response containing token and user data
   *   - Response structure: { token: 'jwt-token-string', user: { email, name, ... } }
   * 
   * @example
   * // Basic usage with error handling:
   * this.authService.login({ email: 'user@example.com', password: 'password123' })
   *   .subscribe({
   *     next: (response) => {
   *       console.log('Login successful!', response.user);
   *       // Component navigation to dashboard happens in LoginComponent
   *     },
   *     error: (error) => {
   *       console.error('Login failed:', error.error.message);
   *       // Handle authentication error - display error message to user
   *     }
   *   });
   * 
   * @see authInterceptor - Uses the stored token for authenticated requests
   * @see LoginComponent - Component that calls this method on form submission
   * @see logout - Method to clear authentication state
   */
  public login(credentials: any) {
    return this.http.post<any>('https://tu-api.com/login', credentials).pipe(
      tap(response => {
        // Store JWT token for future authenticated requests
        localStorage.setItem('token_access', response.token);
        // Update reactive user state - triggers isAuthenticated computed signal
        this.#currentUser.set(response.user);
      })
    );
  }

  /**
   * Logs out the current user and clears authentication state.
   * 
   * Process:
   * 1. Removes the JWT access token from localStorage
   * 2. Clears the currentUser signal (sets to null)
   * 3. isAuthenticated computed signal automatically becomes false
   * 4. authGuard will block navigation to protected routes
   * 
   * Important Notes:
   * - This is a synchronous operation (no HTTP request to backend)
   * - Token is immediately removed, so subsequent requests won't include it
   * - Components observing currentUser or isAuthenticated signals will update reactively
   * - After logout, user must login again to access protected routes
   * 
   * Typical Usage:
   * - Called when user clicks a "Logout" button
   * - Can be called when token expires (token refresh failed)
   * - Can be called after successful logout API call to backend
   * 
   * @returns void
   * 
   * @example
   * // In a logout button handler:
   * onLogout(): void {
   *   this.authService.logout();
   *   this.router.navigate(['/login']);
   *   // Optional: Call backend logout endpoint for session cleanup
   *   // this.http.post('/api/logout', {}).subscribe();
   * }
   * 
   * // In template:
   * // <button (click)=\"onLogout()\">Logout</button>
   * 
   * @see login - Method to authenticate user
   * @see currentUser - Signal cleared to null by this method\n   * @see isAuthenticated - Computed signal that becomes false after logout
   * @see authGuard - Will redirect to login after logout
   */
  public logout() {
    localStorage.removeItem('token_access');
    this.#currentUser.set(null);
  }
}
