import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap, catchError, throwError, map, switchMap } from 'rxjs';
import { 
  UserInfo,
  User,
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ProfileUpdateRequest,
  PasswordChangeRequest,
  TokenRefreshRequest,
  ApiResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../models';
import { environment } from '../../../environments/environment';
import { Application } from '../models/application.model';

/**
 * Authentication Service
 * Handles all authentication-related operations including login, logout, registration,
 * token management, and user session persistence.
 * 
 * Uses Angular signals for reactive state management.
 * Integrates with backend API endpoints.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly tokenKey = environment.auth.tokenKey;
  private readonly refreshTokenKey = 'lt_refresh_token';
  private readonly userKey = environment.auth.userKey;
  private readonly rememberMeKey = environment.auth.rememberMeKey;

  // Reactive state using signals
  private currentUserSignal = signal<UserInfo | null>(null);
  private isLoadingSignal = signal<boolean>(false);
  private isInitializedSignal = signal<boolean>(false);

  // Public computed signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly isInitialized = this.isInitializedSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from storage
   */
  private initializeAuth(): void {
    const token = this.getToken();
    const userJson = this.getStoredUser();

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSignal.set(user);
        // Token validation will happen via HTTP interceptor on first API call
        // Don't validate here to avoid clearing storage on network errors
      } catch {
        this.clearAuthData();
      }
    }
    this.isInitializedSignal.set(true);
  }

  /**
   * Login user with email and password
   * POST /api/Auth/login
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/Auth/login`, credentials).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Login failed');
        }
        return response.data;
      }),
      tap(authResponse => {
        this.handleAuthSuccess(authResponse, credentials.rememberMe ?? false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Register a new user
   * POST /api/Auth/register
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/Auth/register`, data).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Registration failed');
        }
        return response.data;
      }),
      tap(authResponse => {
        this.handleAuthSuccess(authResponse, false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Logout current user
   * POST /api/Auth/logout
   */
  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    
    // Call logout API to invalidate refresh token
    const logoutRequest: TokenRefreshRequest = { refreshToken: refreshToken || '' };
    
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/Auth/logout`, logoutRequest).pipe(
      tap(() => {
        this.performLocalLogout();
      }),
      map(() => undefined),
      catchError(() => {
        // Even if API call fails, perform local logout
        this.performLocalLogout();
        return of(undefined);
      })
    );
  }

  /**
   * Perform local logout without API call
   */
  private performLocalLogout(): void {
    this.clearAuthData();
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Refresh access token using refresh token
   * POST /api/Auth/refresh-token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: TokenRefreshRequest = { refreshToken };

    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/Auth/refresh-token`, request).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Token refresh failed');
        }
        return response.data;
      }),
      tap(authResponse => {
        this.handleAuthSuccess(authResponse, this.isRememberMeEnabled());
      }),
      catchError(error => {
        this.performLocalLogout();
        return this.handleError(error);
      })
    );
  }

  /**
   * Validate current JWT token
   * GET /api/Auth/validate-token
   */
  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }

    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/Auth/validate-token`).pipe(
      map(response => response.success && response.data === true),
      catchError(() => {
        // Token invalid, try to refresh
        return this.refreshToken().pipe(
          map(() => true),
          catchError(() => of(false))
        );
      })
    );
  }

  /**
   * Request password reset
   * POST /api/Auth/forgot-password
   */
  forgotPassword(email: string): Observable<void> {
    const request: ForgotPasswordRequest = { email };
    
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/Auth/forgot-password`, request).pipe(
      map(() => undefined),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Reset password using token
   * POST /api/Auth/reset-password
   */
  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/Auth/reset-password`, request).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Password reset failed');
        }
        return undefined;
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get the current authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) || 
           sessionStorage.getItem(this.tokenKey);
  }

  /**
   * Get the refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey) || 
           sessionStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Check if remember me is enabled
   */
  isRememberMeEnabled(): boolean {
    return localStorage.getItem(this.rememberMeKey) === 'true';
  }

  /**
   * Login with Google OAuth
   * POST /api/Auth/google-login
   */
  googleLogin(idToken: string): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/Auth/google-login`, { idToken }).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Google login failed');
        }
        return response.data;
      }),
      tap(authResponse => {
        this.handleAuthSuccess(authResponse, true); // Google login always remembers
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): number | null {
    const user = this.currentUserSignal();
    return user?.id ?? null;
  }

  // Private helper methods

  private handleAuthSuccess(response: AuthResponse, rememberMe: boolean): void {
    // Always use localStorage for token persistence across page refreshes
    // sessionStorage is cleared on tab close, which causes issues on refresh
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.refreshTokenKey, response.refreshToken);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    
    if (rememberMe) {
      localStorage.setItem(this.rememberMeKey, 'true');
    } else {
      localStorage.removeItem(this.rememberMeKey);
    }

    this.currentUserSignal.set(response.user);
    this.isLoadingSignal.set(false);
  }

  private storeUser(user: UserInfo): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private getStoredUser(): string | null {
    return localStorage.getItem(this.userKey) || 
           sessionStorage.getItem(this.userKey);
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
    sessionStorage.removeItem(this.userKey);
  }

  private handleError(error: HttpErrorResponse | Error): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof HttpErrorResponse) {
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.errors?.length > 0) {
        errorMessage = error.error.errors.join(', ');
      } else if (error.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.status === 400) {
        errorMessage = 'Invalid request data';
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server';
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
