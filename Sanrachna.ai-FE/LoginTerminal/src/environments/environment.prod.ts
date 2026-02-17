/**
 * Production environment configuration
 */
export const environment = {
  production: true,
  appName: 'LoginTerminal',
  appVersion: '1.0.0',
  
  // API Configuration
  apiUrl: 'https://sanrachna-ai-api-dev-dshsc6dce7avf9c7.southindia-01.azurewebsites.net/api',
  
  // Authentication Configuration
  auth: {
    tokenKey: 'lt_auth_token',
    userKey: 'lt_auth_user',
    rememberMeKey: 'lt_remember_me',
    tokenExpiry: 3600,
    refreshTokenExpiry: 604800
  },
  
  // OAuth Configuration
  oauth: {
    google: {
      clientId: '266255622565-6fl707tngjd8449gf26nf43selsaqrd5.apps.googleusercontent.com',
      redirectUri: 'https://ltscan.netlify.app/auth/google/callback'
    }
  },
  
  // Feature Flags
  features: {
    googleLogin: true,
    rememberMe: true,
    darkMode: true
  }
};
