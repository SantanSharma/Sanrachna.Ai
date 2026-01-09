import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { SSO_AUTH_CONFIG } from './core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions()
    ),
    provideHttpClient(withInterceptors([])),
    {
      provide: SSO_AUTH_CONFIG,
      useValue: {
        loginTerminalUrl: 'http://localhost:4200',
        currentAppUrl: 'http://localhost:4205',
        tokenStorageKey: 'viraasat360_auth_token',
        userStorageKey: 'viraasat360_auth_user',
        enableVisibilityValidation: true,
        enableDebugLogging: false,
        loginPath: '/login',
        logoutPath: '/logout'
      }
    }
  ]
};
