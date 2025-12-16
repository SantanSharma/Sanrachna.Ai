/**
 * Development environment configuration
 */
export const environment = {
  production: false,
  appName: 'LoginTerminal',
  appVersion: '1.0.0',
  
  // API Configuration - Backend runs on port 5076
  apiUrl: 'http://localhost:5076/api',
  
  // Authentication Configuration
  auth: {
    tokenKey: 'lt_auth_token',
    userKey: 'lt_auth_user',
    rememberMeKey: 'lt_remember_me',
    tokenExpiry: 3600, // 1 hour in seconds
    refreshTokenExpiry: 604800 // 7 days in seconds
  },
  
  // OAuth Configuration (placeholders)
  oauth: {
    google: {
      clientId: '266255622565-6fl707tngjd8449gf26nf43selsaqrd5.apps.googleusercontent.com',
      redirectUri: 'http://localhost:4200/auth/google/callback'
    }
  },
  
  // Feature Flags
  features: {
    googleLogin: true,
    rememberMe: true,
    darkMode: true
  }
};
