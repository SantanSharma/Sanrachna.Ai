/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast notification model
 */
export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

/**
 * Theme options
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Application settings
 */
export interface AppSettings {
  theme: ThemeMode;
  language: string;
  notifications: boolean;
}
