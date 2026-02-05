import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from "./auth/login/login.component";

/**
 * Root component of the application.
 * 
 * This is the main entry point for the Angular application. It serves as the container
 * for all routed components and manages the overall application layout.
 * 
 * @component
 * Selector: app-root
 * Template: app.html
 * Styles: app.css
 * Imports: RouterOutlet (for routing), LoginComponent
 * 
 * @example
 * // App will render the appropriate component based on the current route:
 * // - Login component at /login
 * // - Dashboard component at /dashboard (with auth guard protection)
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  /**
   * Application title displayed as an immutable signal.
   * This is a reactive property that can be accessed in the template.
   * 
   * @type {WritableSignal<string>}
   * @readonly
   */
  protected readonly title = signal('login-and-register-jwt-angular');
}
