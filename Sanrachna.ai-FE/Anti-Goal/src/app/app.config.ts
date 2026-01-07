import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { SSO_AUTH_CONFIG, SsoAuthConfig } from './core/auth';

/**
 * SSO Authentication Configuration
 */
const ssoAuthConfig: SsoAuthConfig = {
  loginTerminalUrl: 'http://localhost:4200',
  currentAppUrl: 'http://localhost:4203',
  tokenStorageKey: 'antigoal_auth_token',
  userStorageKey: 'antigoal_user',
  enableVisibilityValidation: true,
  enableDebugLogging: false
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    { provide: SSO_AUTH_CONFIG, useValue: ssoAuthConfig }
  ]
};
