import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { SSO_AUTH_CONFIG, SsoAuthConfig } from './core/auth';

/**
 * SSO Authentication Configuration
 * 
 * Configure these values for your application:
 * - loginTerminalUrl: URL of the central Login Terminal app
 * - currentAppUrl: URL of this application (for return redirects)
 * - tokenStorageKey: Unique localStorage key for auth token
 * - userStorageKey: Unique localStorage key for user data
 */
const ssoAuthConfig: SsoAuthConfig = {
  loginTerminalUrl: 'http://localhost:4200',
  currentAppUrl: 'http://localhost:4202',
  tokenStorageKey: 'standby_auth_token',
  userStorageKey: 'standby_user',
  enableVisibilityValidation: true,
  enableDebugLogging: false // Set to true for debugging
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: SSO_AUTH_CONFIG, useValue: ssoAuthConfig }
  ]
};
