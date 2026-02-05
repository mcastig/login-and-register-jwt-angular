import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/**
 * Application Bootstrap Entry Point
 * 
 * This is the main entry point for the Angular application. It:
 * 1. Imports the root App component (the application shell)
 * 2. Imports the application configuration (appConfig with all providers)
 * 3. Bootstraps the App component into the DOM
 * 4. Handles any bootstrap errors by logging them to console
 * 
 * The bootstrapApplication function is part of Angular's standalone API,
 * which simplifies application setup without requiring NgModules.
 * This replaces the traditional main.ts setup with an Angular Module.
 * 
 * Execution flow:
 * - This script is executed by the Angular CLI dev server
 * - App component is rendered into the root element in index.html
 * - appConfig providers are initialized and made available to the entire application
 * - Routing starts and displays the appropriate component based on the current URL
 * 
 * @see App - Root component in app/app.ts
 * @see appConfig - Application configuration in app/app.config.ts
 */
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
