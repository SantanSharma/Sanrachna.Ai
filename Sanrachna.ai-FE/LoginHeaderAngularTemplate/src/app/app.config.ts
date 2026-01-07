import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
import { SSO_AUTH_CONFIG, SsoAuthConfig } from './core';

/**
 * SSO Authentication Configuration for this application
 *
 * IMPORTANT: Update these values for your deployment:
 * - loginTerminalUrl: URL of your Login Terminal
 * - currentAppUrl: URL of this application
 * - tokenStorageKey: Unique key for token storage
 * - userStorageKey: Unique key for user info storage
 */
const ssoAuthConfig: SsoAuthConfig = {
  loginTerminalUrl: 'http://localhost:4200',     // Login Terminal URL
  currentAppUrl: 'http://localhost:4204',        // This app's URL
  tokenStorageKey: 'template_auth_token',        // Unique token storage key
  userStorageKey: 'template_user',               // Unique user storage key
  enableVisibilityValidation: true,              // Auto-validate on focus
  enableDebugLogging: true,                      // Enable for development
  loginPath: '/login',                           // Login path on Login Terminal
  logoutPath: '/logout'                          // Logout path on Login Terminal
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),

    // Provide SSO authentication configuration
    { provide: SSO_AUTH_CONFIG, useValue: ssoAuthConfig }
  ]
};
