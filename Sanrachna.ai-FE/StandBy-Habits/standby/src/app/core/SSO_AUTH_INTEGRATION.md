# SSO Authentication Integration Guide

This guide explains how to integrate the SSO (Single Sign-On) authentication module into a new Angular application that connects to the **Login Terminal** central authentication service.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Quick Start (5 Minutes)](#quick-start)
3. [Detailed Integration Steps](#detailed-integration-steps)
4. [Configuration Options](#configuration-options)
5. [API Reference](#api-reference)
6. [How It Works](#how-it-works)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Login Terminal (Port 4200)                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────────────┐  │
│  │    Login    │───▶│  Dashboard  │───▶│  Launch App with ?token=...    │  │
│  └─────────────┘    └─────────────┘    │  &user={encoded user info}     │  │
│         ▲                              └─────────────────────────────────┘  │
│         │                                             │                     │
│         │ returnUrl=app.url                           │ SSO Token           │
│         │                                             ▼                     │
│  ┌──────┴──────┐    ┌─────────────────────────────────────────────────────┐ │
│  │   Logout    │◀───│  SSO Logout (?ssoLogout=true&returnUrl=...)        │ │
│  └─────────────┘    └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Token + User Info via URL
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Your Angular App (e.g., Port 4202)                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  SsoAuthService                                                         ││
│  │  ├── initializeAuth()     → Extract token from URL or storage           ││
│  │  ├── validateAndRefresh() → Check token on window focus                 ││
│  │  ├── logout()             → Clear local + redirect to SSO logout        ││
│  │  ├── getToken()           → For API calls                               ││
│  │  └── user signal          → Reactive user state                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Step 1: Copy the Core Folder

Copy the entire `src/app/core` folder to your new Angular application:

```
src/app/core/
├── auth/
│   ├── auth.config.ts       # Configuration types and injection token
│   ├── sso-auth.service.ts  # Main authentication service
│   └── index.ts             # Barrel exports
├── components/
│   ├── user-profile-dropdown.component.ts  # Reusable user dropdown
│   └── index.ts
└── index.ts                 # Core module barrel export
```

### Step 2: Configure in app.config.ts

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { SSO_AUTH_CONFIG, SsoAuthConfig } from './core/auth';

const ssoAuthConfig: SsoAuthConfig = {
  loginTerminalUrl: 'http://localhost:4200',        // Login Terminal URL
  currentAppUrl: 'http://localhost:4202',           // This app's URL
  tokenStorageKey: 'myapp_auth_token',              // Unique key for token
  userStorageKey: 'myapp_user',                     // Unique key for user
  enableVisibilityValidation: true,                 // Auto-check on tab focus
  enableDebugLogging: false                         // Enable for debugging
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: SSO_AUTH_CONFIG, useValue: ssoAuthConfig }
  ]
};
```

### Step 3: Initialize in app.component.ts

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SsoAuthService } from './core/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    @if (authService.isAuthenticated()) {
      <router-outlet></router-outlet>
    } @else {
      <div class="loading">Authenticating...</div>
    }
  `
})
export class AppComponent implements OnInit {
  authService = inject(SsoAuthService);

  ngOnInit(): void {
    this.authService.initializeAuth();
    this.authService.setupVisibilityListener();
  }
}
```

### Step 4: Display User Info (Optional)

Use the built-in dropdown component:

```typescript
import { UserProfileDropdownComponent } from './core/components';

@Component({
  imports: [UserProfileDropdownComponent],
  template: `
    <header>
      <!-- Your header content -->
      <app-user-profile-dropdown></app-user-profile-dropdown>
    </header>
  `
})
```

Or access user data directly:

```typescript
@Component({
  template: `
    @if (authService.user(); as user) {
      <span>Welcome, {{ user.name }}</span>
      <img [src]="user.avatarUrl" [alt]="user.name" />
    }
  `
})
export class MyComponent {
  authService = inject(SsoAuthService);
}
```

---

## Detailed Integration Steps

### 1. Prerequisites

- Angular 17+ with standalone components
- Login Terminal running and accessible
- Application registered in Login Terminal's application list

### 2. File Structure After Integration

```
src/app/
├── core/                          # ← Copy this folder
│   ├── auth/
│   │   ├── auth.config.ts
│   │   ├── sso-auth.service.ts
│   │   └── index.ts
│   ├── components/
│   │   ├── user-profile-dropdown.component.ts
│   │   └── index.ts
│   └── index.ts
├── app.config.ts                  # ← Add SSO_AUTH_CONFIG provider
├── app.component.ts               # ← Initialize auth
└── ...
```

### 3. Environment-Based Configuration

For production deployments, use environment files:

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  sso: {
    loginTerminalUrl: 'http://localhost:4200',
    currentAppUrl: 'http://localhost:4202'
  }
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  sso: {
    loginTerminalUrl: 'https://auth.mycompany.com',
    currentAppUrl: 'https://myapp.mycompany.com'
  }
};

// app.config.ts
import { environment } from '../environments/environment';

const ssoAuthConfig: SsoAuthConfig = {
  loginTerminalUrl: environment.sso.loginTerminalUrl,
  currentAppUrl: environment.sso.currentAppUrl,
  tokenStorageKey: 'myapp_auth_token',
  userStorageKey: 'myapp_user'
};
```

### 4. Making Authenticated API Calls

```typescript
import { HttpClient } from '@angular/common/http';
import { SsoAuthService } from './core/auth';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private authService = inject(SsoAuthService);

  getData() {
    return this.http.get('/api/data', {
      headers: this.authService.getAuthHeader()
    });
  }
}
```

Or use an HTTP interceptor:

```typescript
// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SsoAuthService } from './core/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(SsoAuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};

// app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    // ... other providers
  ]
};
```

---

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `loginTerminalUrl` | string | **Required** | Base URL of the Login Terminal |
| `currentAppUrl` | string | **Required** | This application's URL |
| `tokenStorageKey` | string | **Required** | LocalStorage key for auth token |
| `userStorageKey` | string | **Required** | LocalStorage key for user data |
| `enableVisibilityValidation` | boolean | `true` | Check token validity on window focus |
| `enableDebugLogging` | boolean | `false` | Log auth events to console |
| `loginPath` | string | `/login` | Login page path on Login Terminal |
| `logoutPath` | string | `/logout` | Logout page path on Login Terminal |

---

## API Reference

### SsoAuthService

#### Signals (Reactive State)

| Signal | Type | Description |
|--------|------|-------------|
| `user` | `Signal<UserInfo \| null>` | Current authenticated user |
| `isAuthenticated` | `Signal<boolean>` | Whether user is logged in |
| `isInitialized` | `Signal<boolean>` | Whether auth has been initialized |

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `initializeAuth()` | `boolean` | Initialize auth from URL or storage. Returns true if authenticated. |
| `setupVisibilityListener()` | `void` | Setup auto-validation on window focus |
| `getToken()` | `string \| null` | Get the JWT token |
| `getAuthHeader()` | `object` | Get `{ Authorization: 'Bearer ...' }` header |
| `getCurrentUser()` | `UserInfo \| null` | Get current user synchronously |
| `logout()` | `void` | Clear auth and redirect to SSO logout |
| `validateAndRefresh()` | `void` | Validate token and redirect if invalid |

### UserInfo Interface

```typescript
interface UserInfo {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
}
```

---

## How It Works

### Token Decoding

The service decodes JWT tokens without external libraries using base64url decoding:

```typescript
// Token structure: header.payload.signature
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
```

### Session Validation Flow

1. **On App Load (`initializeAuth()`)**:
   - Check URL for `?token=...` (SSO redirect from Login Terminal)
   - If found: decode, validate, store, and display app
   - If not: check localStorage for existing token
   - If no valid token: redirect to Login Terminal

2. **On Window Focus (`setupVisibilityListener()`)**:
   - Validate stored token
   - If expired/invalid: clear and redirect to login
   - This catches logout from Login Terminal

3. **On Logout**:
   - Clear local storage
   - Redirect to Login Terminal's `/logout?ssoLogout=true`
   - Login Terminal logs out and redirects to login page

### Token Expiration

- Tokens are validated using the `exp` claim
- 30-second buffer is added to account for clock skew
- Expired tokens trigger automatic logout

---

## Troubleshooting

### "SSO_AUTH_CONFIG not provided" Error

Ensure you've added the provider in `app.config.ts`:

```typescript
providers: [
  { provide: SSO_AUTH_CONFIG, useValue: ssoAuthConfig }
]
```

### User Shows as "User" with Empty Email

This means JWT claims are missing. Ensure Login Terminal passes user info:

```typescript
// Login Terminal should append: &user={encoded user JSON}
const ssoUrl = `${app.url}?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;
```

### Redirect Loop

Check that:
1. Login Terminal URL is correct
2. Current app URL matches what's registered in Login Terminal
3. Token is not expired immediately after login

### Token Not Persisting

- Check browser's localStorage isn't full or blocked
- Verify `tokenStorageKey` is unique per application
- Check for JavaScript errors in console

### Debug Mode

Enable logging to see auth flow:

```typescript
const ssoAuthConfig: SsoAuthConfig = {
  // ...
  enableDebugLogging: true
};
```

Console will show:
```
[SsoAuth] Auth service initialized with config: {...}
[SsoAuth] Initializing auth...
[SsoAuth] Token found in URL, processing...
[SsoAuth] Using user info from URL
[SsoAuth] Token valid, user authenticated
```

---

## Checklist for New App Integration

- [ ] Copy `src/app/core` folder
- [ ] Add `SSO_AUTH_CONFIG` provider in `app.config.ts`
- [ ] Call `initializeAuth()` in `app.component.ts`
- [ ] Call `setupVisibilityListener()` in `app.component.ts`
- [ ] Add conditional rendering based on `isAuthenticated()`
- [ ] Update environment files for production URLs
- [ ] Add app to Login Terminal's application list
- [ ] Test SSO login flow
- [ ] Test logout from both apps
- [ ] Test tab switching detection

---

## Support

For issues with:
- **This auth module**: Check the integration steps and enable debug logging
- **Login Terminal**: Contact the Login Terminal maintainers
- **Token issues**: Verify JWT structure and expiration claims
