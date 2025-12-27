import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guest Guard
 * Protects auth routes (login, register) from authenticated users.
 * Redirects authenticated users to the dashboard.
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth initialization
  if (!authService.isInitialized()) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (authService.isInitialized()) {
          clearInterval(checkInterval);
          resolve(checkGuest());
        }
      }, 50);
    });
  }

  return checkGuest();

  function checkGuest(): boolean {
    if (!authService.isAuthenticated()) {
      return true;
    }

    // Already authenticated, redirect to dashboard
    router.navigate(['/dashboard']);
    return false;
  }
};
