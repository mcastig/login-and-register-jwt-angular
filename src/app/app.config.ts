import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

/**
 * Application configuration object.
 * 
 * Configures core services and providers for the Angular application using the standalone API:
 * 
 * Providers:
 * 1. provideBrowserGlobalErrorListeners() - Handles uncaught errors globally
 * 2. provideRouter(routes) - Enables client-side routing based on app.routes configuration
 * 3. provideHttpClient(withInterceptors([authInterceptor])) - Provides HTTP client with JWT interceptor
 *    - authInterceptor automatically attaches JWT tokens to all HTTP requests
 *    - Retrieves token from localStorage and adds it to Authorization header
 * 
 * This configuration replaces the traditional NgModule-based setup, simplifying the
 * application structure and enabling tree-shaking of unused providers.
 * 
 * @type {ApplicationConfig}
 * 
 * @see app.routes - Route configuration
 * @see authInterceptor - HTTP interceptor for JWT token attachment in core/interceptors
 * @see main.ts - Where appConfig is passed to bootstrapApplication
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
