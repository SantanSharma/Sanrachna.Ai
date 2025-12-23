/**
 * ============================================================================
 * SSO Authentication Module - Public API
 * ============================================================================
 *
 * This barrel file exports all public APIs for the SSO authentication module.
 * Import from this file in your application code.
 *
 * @example
 * import { SsoAuthService, SSO_AUTH_CONFIG, SsoAuthConfig, UserInfo } from './core/auth';
 *
 * ============================================================================
 */

// Configuration - Types (use 'export type' for isolatedModules compatibility)
export type { SsoAuthConfig, UserInfo, JwtPayload } from './auth.config';

// Configuration - Values
export { SSO_AUTH_CONFIG, DEFAULT_SSO_AUTH_CONFIG } from './auth.config';

// Service
export { SsoAuthService } from './sso-auth.service';
