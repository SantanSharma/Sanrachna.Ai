import { Injectable, signal, computed, inject, Optional, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  UserInfo,
  JwtPayload,
  SsoAuthConfig,
  SSO_AUTH_CONFIG,
  DEFAULT_SSO_AUTH_CONFIG
} from './auth.config';

/**
 * ============================================================================
 * SSO Authentication Service
 * ============================================================================
 */
@Injectable({
  providedIn: 'root'
})
export class SsoAuthService {
  private router = inject(Router);
  private config: SsoAuthConfig;

  private userSignal = signal<UserInfo | null>(null);
  private isInitializedSignal = signal<boolean>(false);

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.userSignal());
  readonly isInitialized = this.isInitializedSignal.asReadonly();

  constructor(@Optional() @Inject(SSO_AUTH_CONFIG) config: SsoAuthConfig | null) {
    if (!config) {
      throw new Error(
        'SsoAuthService: SSO_AUTH_CONFIG not provided. ' +
        'Please provide SSO_AUTH_CONFIG in your app.config.ts'
      );
    }

    this.config = { ...DEFAULT_SSO_AUTH_CONFIG, ...config } as SsoAuthConfig;
    this.log('Auth service initialized with config:', this.config);
    this.initializeFromStorage();
  }

  initializeAuth(): boolean {
    this.log('Initializing auth...');

    const urlToken = this.extractTokenFromUrl();
    const urlUser = this.extractUserFromUrl();

    if (urlToken) {
      this.log('Token found in URL, processing...');
      const isValid = this.processToken(urlToken, urlUser);
      this.cleanUrl();

      if (!isValid) {
        this.log('Token invalid, redirecting to login');
        this.redirectToLogin();
        return false;
      }

      this.log('Token valid, user authenticated');
      return true;
    }

    const storedToken = this.getToken();
    if (storedToken && this.isTokenValid(storedToken)) {
      this.log('Valid token found in storage');
      return true;
    }

    this.log('No valid token, redirecting to login');
    this.redirectToLogin();
    return false;
  }

  setupVisibilityListener(): void {
    if (!this.config.enableVisibilityValidation) {
      this.log('Visibility validation disabled');
      return;
    }

    this.log('Setting up visibility listeners');

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.validateAndRefresh();
      }
    });

    window.addEventListener('focus', () => {
      this.validateAndRefresh();
    });
  }

  getToken(): string | null {
    return localStorage.getItem(this.config.tokenStorageKey);
  }

  getAuthHeader(): { [key: string]: string } {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getCurrentUser(): UserInfo | null {
    return this.userSignal();
  }

  logout(): void {
    this.log('Logging out...');
    this.clearAuth();

    const returnUrl = encodeURIComponent(
      `${this.config.loginTerminalUrl}${this.config.loginPath}`
    );
    const logoutUrl = `${this.config.loginTerminalUrl}${this.config.logoutPath}?ssoLogout=true&returnUrl=${returnUrl}`;

    this.log('Redirecting to:', logoutUrl);
    window.location.href = logoutUrl;
  }

  validateAndRefresh(): void {
    const token = this.getToken();

    if (!token || !this.isTokenValid(token)) {
      this.log('Token invalid or expired, redirecting to login');
      this.clearAuth();
      this.redirectToLogin();
    }
  }

  private extractTokenFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
  }

  private extractUserFromUrl(): UserInfo | null {
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');

    if (userParam) {
      try {
        return JSON.parse(decodeURIComponent(userParam));
      } catch (e) {
        this.log('Failed to parse user from URL:', e);
        return null;
      }
    }
    return null;
  }

  private cleanUrl(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    url.searchParams.delete('user');
    window.history.replaceState({}, document.title, url.pathname + url.search);
  }

  private processToken(token: string, urlUser: UserInfo | null): boolean {
    try {
      const payload = this.decodeJwt(token);

      if (!payload || this.isTokenExpired(payload.exp)) {
        this.log('Token is invalid or expired');
        return false;
      }

      let user: UserInfo;
      if (urlUser && urlUser.name && urlUser.email) {
        user = urlUser;
        this.log('Using user info from URL');
      } else {
        user = {
          id: parseInt(payload.sub, 10) || 0,
          name: payload.name || 'User',
          email: payload.email || '',
          avatarUrl: payload.avatar,
          role: payload.role || 'user'
        };
        this.log('Using user info from JWT claims');
      }

      this.storeAuthData(token, user);
      this.userSignal.set(user);

      return true;
    } catch (error) {
      this.log('Failed to process token:', error);
      return false;
    }
  }

  private decodeJwt(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  private isTokenExpired(exp: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    return exp < (now - 30);
  }

  private isTokenValid(token: string): boolean {
    const payload = this.decodeJwt(token);
    return payload !== null && !this.isTokenExpired(payload.exp);
  }

  private storeAuthData(token: string, user: UserInfo): void {
    localStorage.setItem(this.config.tokenStorageKey, token);
    localStorage.setItem(this.config.userStorageKey, JSON.stringify(user));
  }

  private initializeFromStorage(): void {
    const token = this.getToken();
    const userJson = localStorage.getItem(this.config.userStorageKey);

    if (token && userJson && this.isTokenValid(token)) {
      try {
        this.userSignal.set(JSON.parse(userJson));
        this.log('User restored from storage');
      } catch {
        this.clearAuth();
      }
    }
    this.isInitializedSignal.set(true);
  }

  private clearAuth(): void {
    localStorage.removeItem(this.config.tokenStorageKey);
    localStorage.removeItem(this.config.userStorageKey);
    this.userSignal.set(null);
    this.log('Auth data cleared');
  }

  private redirectToLogin(): void {
    const returnUrl = encodeURIComponent(this.config.currentAppUrl);
    const loginUrl = `${this.config.loginTerminalUrl}${this.config.loginPath}?returnUrl=${returnUrl}`;
    this.log('Redirecting to login:', loginUrl);
    window.location.href = loginUrl;
  }

  private log(...args: unknown[]): void {
    if (this.config.enableDebugLogging) {
      console.log('[SsoAuth]', ...args);
    }
  }
}
