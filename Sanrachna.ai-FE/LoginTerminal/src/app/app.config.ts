import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

/**
 * Application configuration for LoginTerminal
 * Configures routing, HTTP client, and authentication interceptor
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes, 
      withComponentInputBinding(),
      withViewTransitions()
    ),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
