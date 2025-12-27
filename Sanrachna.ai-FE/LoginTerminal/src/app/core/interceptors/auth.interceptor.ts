import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

// Flag to prevent multiple simultaneous token refresh requests
let isRefreshing = false;

/**
 * Authentication Interceptor
 * Attaches JWT token to outgoing requests and handles authentication errors.
 * 
 * Features:
 * - Automatically adds Authorization header with Bearer token
 * - Handles 401 Unauthorized responses by attempting token refresh
 * - Handles 403 Forbidden responses with appropriate messaging
 * - Handles network and server errors
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  // Skip auth header for auth endpoints (except logout and validate)
  const isAuthEndpoint = req.url.includes('/Auth/login') || 
                         req.url.includes('/Auth/register') ||
                         req.url.includes('/Auth/refresh-token') ||
                         req.url.includes('/Auth/forgot-password') ||
                         req.url.includes('/Auth/reset-password');

  // Get the auth token
  const token = authService.getToken();

  // Clone the request and add authorization header if token exists and not an auth endpoint
  let authReq = req;
  if (token && !isAuthEndpoint) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle the request and catch errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized - try to refresh token
      if (error.status === 401 && !isAuthEndpoint && !req.url.includes('/Auth/validate-token')) {
        if (!isRefreshing) {
          isRefreshing = true;
          
          return authService.refreshToken().pipe(
            switchMap(response => {
              isRefreshing = false;
              // Retry the original request with new token
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.token}`
                }
              });
              return next(newReq);
            }),
            catchError(refreshError => {
              isRefreshing = false;
              toastService.error('Session Expired', 'Please log in again.');
              router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        }
      }
      
      if (error.status === 403) {
        // Forbidden - insufficient permissions
        toastService.error('Access Denied', 'You do not have permission to perform this action.');
      } else if (error.status === 0) {
        // Network error
        toastService.error('Network Error', 'Unable to connect to the server. Please check your connection.');
      } else if (error.status >= 500) {
        // Server error
        toastService.error('Server Error', 'Something went wrong. Please try again later.');
      }

      return throwError(() => error);
    })
  );
};
