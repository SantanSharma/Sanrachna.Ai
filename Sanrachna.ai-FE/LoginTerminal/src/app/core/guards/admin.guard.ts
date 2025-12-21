import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Admin Guard
 * Protects routes that require admin role.
 * Redirects non-admin users to the dashboard.
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth initialization
  if (!authService.isInitialized()) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (authService.isInitialized()) {
          clearInterval(checkInterval);
          resolve(checkAdminAuth());
        }
      }, 50);
    });
  }

  return checkAdminAuth();

  function checkAdminAuth(): boolean {
    if (!authService.isAuthenticated()) {
      router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    const user = authService.currentUser();
    if (user?.role?.toLowerCase() === 'admin') {
      return true;
    }

    // Not an admin, redirect to dashboard
    router.navigate(['/dashboard']);
    return false;
  }
};
