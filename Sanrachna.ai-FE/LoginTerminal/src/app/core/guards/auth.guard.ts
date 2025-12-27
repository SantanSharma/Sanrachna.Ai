import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard
 * Protects routes that require authentication.
 * Redirects unauthenticated users to the login page.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth initialization
  if (!authService.isInitialized()) {
    // Return a promise that resolves once initialized
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (authService.isInitialized()) {
          clearInterval(checkInterval);
          resolve(checkAuth());
        }
      }, 50);
    });
  }

  return checkAuth();

  function checkAuth(): boolean {
    if (authService.isAuthenticated()) {
      return true;
    }

    // Store the attempted URL for redirecting after login
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
};
