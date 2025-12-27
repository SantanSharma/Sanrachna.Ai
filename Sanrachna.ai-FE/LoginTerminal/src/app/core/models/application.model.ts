/**
 * Application model representing an SSO-enabled application
 * (matches backend ApplicationDto)
 */
export interface Application {
  id: number;
  name: string;
  description: string;
  url: string;
  icon: string;
  iconColor: string;
  category: string;
  isSupported: boolean;
  requiresAuth: boolean;
  displayOrder: number;
  isActive: boolean;
  grantedAt?: Date;
}

/**
 * Application category for grouping
 */
export type ApplicationCategory = string;

// Common category constants
export const ApplicationCategories = {
  Communication: 'Communication',
  Productivity: 'Productivity',
  Development: 'Development',
  Analytics: 'Analytics',
  Administration: 'Administration',
  Other: 'Other'
} as const;

/**
 * Application create request (matches backend ApplicationCreateDto)
 */
export interface ApplicationCreateRequest {
  name: string;
  description: string;
  url: string;
  icon: string;
  iconColor: string;
  category: string;
  isSupported: boolean;
  requiresAuth: boolean;
  displayOrder: number;
}

/**
 * Application update request (matches backend ApplicationUpdateDto)
 */
export interface ApplicationUpdateRequest {
  name: string;
  description: string;
  url: string;
  icon: string;
  iconColor: string;
  category: string;
  isSupported: boolean;
  requiresAuth: boolean;
  displayOrder: number;
  isActive: boolean;
}

/**
 * Application access assignment (matches backend ApplicationAccessDto)
 */
export interface ApplicationAccessRequest {
  userId: number;
  applicationId: number;
}
