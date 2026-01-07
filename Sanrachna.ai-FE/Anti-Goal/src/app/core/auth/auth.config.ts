import { InjectionToken } from '@angular/core';

/**
 * ============================================================================
 * SSO Authentication Configuration
 * ============================================================================
 */

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
}

export interface JwtPayload {
  sub: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
  exp: number;
  iat: number;
  [key: string]: unknown;
}

export interface SsoAuthConfig {
  loginTerminalUrl: string;
  currentAppUrl: string;
  tokenStorageKey: string;
  userStorageKey: string;
  enableVisibilityValidation?: boolean;
  enableDebugLogging?: boolean;
  loginPath?: string;
  logoutPath?: string;
}

export const SSO_AUTH_CONFIG = new InjectionToken<SsoAuthConfig>('SSO_AUTH_CONFIG');

export const DEFAULT_SSO_AUTH_CONFIG: Partial<SsoAuthConfig> = {
  enableVisibilityValidation: true,
  enableDebugLogging: false,
  loginPath: '/login',
  logoutPath: '/logout'
};
