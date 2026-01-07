import { InjectionToken } from '@angular/core';

/**
 * ============================================================================
 * SSO Authentication Configuration
 * ============================================================================
 *
 * This configuration file defines the settings for Single Sign-On (SSO)
 * authentication with a central Login Terminal application.
 *
 * USAGE:
 * 1. Copy the entire `core/auth` folder to your new Angular application
 * 2. Update the configuration values in your app's providers
 * 3. Initialize auth in your app.component.ts
 *
 * ============================================================================
 */

/**
 * User information interface
 * Represents the authenticated user's profile data
 */
export interface UserInfo {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
}

/**
 * JWT Payload interface
 * Represents the decoded JWT token claims
 */
export interface JwtPayload {
  sub: string;        // User ID
  name?: string;      // User's display name
  email?: string;     // User's email
  avatar?: string;    // Avatar URL
  role?: string;      // User role
  exp: number;        // Expiration timestamp (Unix)
  iat: number;        // Issued at timestamp (Unix)
  [key: string]: unknown; // Allow additional claims
}

/**
 * SSO Authentication Configuration
 * All settings required to integrate with the Login Terminal
 */
export interface SsoAuthConfig {
  /**
   * Base URL of the Login Terminal application
   * @example 'http://localhost:4200' or 'https://auth.mycompany.com'
   */
  loginTerminalUrl: string;

  /**
   * Current application's URL (used for returnUrl in redirects)
   * @example 'http://localhost:4202' or 'https://myapp.mycompany.com'
   */
  currentAppUrl: string;

  /**
   * LocalStorage key for storing the auth token
   * Use a unique prefix per app to avoid conflicts
   * @example 'myapp_auth_token'
   */
  tokenStorageKey: string;

  /**
   * LocalStorage key for storing user info
   * Use a unique prefix per app to avoid conflicts
   * @example 'myapp_user'
   */
  userStorageKey: string;

  /**
   * Enable automatic token validation on window focus/visibility
   * Recommended for detecting logout from other apps
   * @default true
   */
  enableVisibilityValidation?: boolean;

  /**
   * Enable console logging for debugging auth flow
   * @default false
   */
  enableDebugLogging?: boolean;

  /**
   * Custom login path on the Login Terminal
   * @default '/login'
   */
  loginPath?: string;

  /**
   * Custom logout path on the Login Terminal
   * @default '/logout'
   */
  logoutPath?: string;
}

/**
 * Injection token for providing SSO auth configuration
 */
export const SSO_AUTH_CONFIG = new InjectionToken<SsoAuthConfig>('SSO_AUTH_CONFIG');

/**
 * Default configuration values
 * These are merged with provided config
 */
export const DEFAULT_SSO_AUTH_CONFIG: Partial<SsoAuthConfig> = {
  enableVisibilityValidation: true,
  enableDebugLogging: false,
  loginPath: '/login',
  logoutPath: '/logout'
};
