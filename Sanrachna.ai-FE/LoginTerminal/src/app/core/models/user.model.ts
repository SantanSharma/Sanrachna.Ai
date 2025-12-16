/**
 * API Response wrapper matching backend ApiResponse<T>
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

/**
 * Paginated result matching backend PaginatedResult<T>
 */
export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * User info from auth response (matches backend UserInfoDto)
 */
export interface UserInfo {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
}

/**
 * Full user details (matches backend UserDto)
 */
export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  isActive: boolean;
  emailConfirmed: boolean;
  roleName: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

/**
 * User role enum
 */
export enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest'
}

/**
 * Login request payload (matches backend LoginRequestDto)
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Register request payload (matches backend RegisterRequestDto)
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Authentication response from the server (matches backend AuthResponseDto)
 */
export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: Date;
  user: UserInfo;
}

/**
 * Token refresh request (matches backend TokenRefreshRequestDto)
 */
export interface TokenRefreshRequest {
  refreshToken: string;
}

/**
 * Password change request (matches backend PasswordChangeDto)
 */
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Profile update request (matches backend UserUpdateDto)
 */
export interface ProfileUpdateRequest {
  name: string;
  avatarUrl?: string;
}

/**
 * Forgot password request (matches backend ForgotPasswordRequestDto)
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset password request (matches backend ResetPasswordRequestDto)
 */
export interface ResetPasswordRequest {
  token: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}
