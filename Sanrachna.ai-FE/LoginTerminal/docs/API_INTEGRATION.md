# API Integration Documentation

## Overview
This document provides a comprehensive summary of the API integration between the LoginTerminal frontend application and the Sanrachna.Ai backend APIs.

## Backend API Endpoints

### Authentication Controller (`/api/Auth`)

| Endpoint | Method | Description | Frontend Integration |
|----------|--------|-------------|----------------------|
| `/api/Auth/login` | POST | User login with email/password | ✅ `AuthService.login()` |
| `/api/Auth/register` | POST | Register new user | ✅ `AuthService.register()` |
| `/api/Auth/logout` | POST | Logout and invalidate refresh token | ✅ `AuthService.logout()` |
| `/api/Auth/refresh-token` | POST | Refresh access token | ✅ `AuthService.refreshToken()` |
| `/api/Auth/validate-token` | GET | Validate current JWT token | ✅ `AuthService.validateToken()` |
| `/api/Auth/forgot-password` | POST | Request password reset | ✅ `AuthService.forgotPassword()` |
| `/api/Auth/reset-password` | POST | Reset password using token | ✅ `AuthService.resetPassword()` |

### Users Controller (`/api/Users`)

| Endpoint | Method | Description | Frontend Integration |
|----------|--------|-------------|----------------------|
| `/api/Users/me` | GET | Get current user profile | ✅ `UserService.getCurrentUser()` |
| `/api/Users/{id}` | GET | Get user by ID (Admin) | ✅ `UserService.getUserById()` |
| `/api/Users` | GET | Get all users paginated (Admin) | ✅ `UserService.getAllUsers()` |
| `/api/Users/{id}` | PUT | Update user profile | ✅ `UserService.updateProfile()` |
| `/api/Users/{id}` | DELETE | Delete user (Admin) | ✅ `UserService.deleteUser()` |
| `/api/Users/{id}/password` | PUT | Change user password | ✅ `UserService.changePassword()` |

### Applications Controller (`/api/apps`)

| Endpoint | Method | Description | Frontend Integration |
|----------|--------|-------------|----------------------|
| `/api/apps` | GET | Get all applications | ✅ `ApplicationService.getAllApplications()` |
| `/api/apps/{id}` | GET | Get application by ID | ✅ `ApplicationService.getApplicationById()` |
| `/api/apps/my` | GET | Get current user's applications | ✅ `ApplicationService.getMyApplications()` |
| `/api/apps/user/{userId}` | GET | Get user's applications | ✅ `ApplicationService.getUserApplications()` |
| `/api/apps` | POST | Create application (Admin) | ✅ `ApplicationService.createApplication()` |
| `/api/apps/{id}` | PUT | Update application (Admin) | ✅ `ApplicationService.updateApplication()` |
| `/api/apps/{id}` | DELETE | Delete application (Admin) | ✅ `ApplicationService.deleteApplication()` |
| `/api/apps/assign` | POST | Assign app access (Admin) | ✅ `ApplicationService.assignAccess()` |
| `/api/apps/revoke` | DELETE | Revoke app access (Admin) | ✅ `ApplicationService.revokeAccess()` |

## Frontend Components and Actions

### Login Component (`/login`)
- **Sign In Button**: Calls `AuthService.login()` → `POST /api/Auth/login`
- **Remember Me**: Persists tokens in localStorage vs sessionStorage
- **Google Login**: Placeholder (not configured in backend)

### Register Component (`/register`)
- **Create Account Button**: Calls `AuthService.register()` → `POST /api/Auth/register`

### Logout Component (`/logout`)
- **Sign Out Button**: Calls `AuthService.logout()` → `POST /api/Auth/logout`

### Dashboard Component (`/dashboard`)
- **On Load**: Calls `ApplicationService.getMyApplications()` → `GET /api/apps/my`
- **Search**: Client-side filtering of loaded applications
- **Launch App**: Opens application URL with SSO token

### Settings Component (`/settings`)
- **Profile Tab - Save Changes**: Calls `UserService.updateCurrentUserProfile()` → `PUT /api/Users/{id}`
- **Password Tab - Update Password**: Calls `UserService.changeCurrentUserPassword()` → `PUT /api/Users/{id}/password`
- **Appearance Tab**: Client-side theme persistence (localStorage)

## Files Modified

### Models
- `src/app/core/models/user.model.ts` - Updated to match backend DTOs
- `src/app/core/models/application.model.ts` - Updated to match backend DTOs

### Services
- `src/app/core/services/auth.service.ts` - Complete rewrite with real API calls
- `src/app/core/services/user.service.ts` - **NEW** - User profile operations
- `src/app/core/services/application.service.ts` - **NEW** - Application management
- `src/app/core/services/index.ts` - Updated exports

### Interceptors
- `src/app/core/interceptors/auth.interceptor.ts` - Added token refresh logic

### Components
- `src/app/features/dashboard/dashboard.component.ts` - Uses ApplicationService
- `src/app/features/settings/settings.component.ts` - Uses UserService, updated form
- `src/app/features/auth/login/login.component.ts` - Removed demo mode notice

### Configuration
- `src/environments/environment.ts` - Updated API URL to port 8080

## API Response Format

All backend APIs return responses wrapped in `ApiResponse<T>`:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}
```

## Authentication Flow

1. **Login**: User submits credentials → Backend returns JWT + Refresh Token
2. **Request**: Auth interceptor adds `Authorization: Bearer {token}` header
3. **Token Expired (401)**: Interceptor attempts token refresh using refresh token
4. **Refresh Success**: New tokens stored, original request retried
5. **Refresh Failure**: User redirected to login page

## Missing Features / Not Implemented in Backend

1. **Google OAuth**: Backend has no OAuth endpoints implemented
2. **Email Update**: Backend `UserUpdateDto` doesn't include email field (email is immutable)
3. **Avatar Upload**: Only URL-based avatars supported (no file upload endpoint)

## Potential Backend Enhancements

1. Add file upload endpoint for user avatars
2. Implement OAuth providers (Google, Microsoft, etc.)
3. Add email change with verification flow
4. Add endpoint to get user's active sessions
5. Add endpoint for account deletion request

## Configuration Notes

### Development
- Frontend: `http://localhost:4200`
- Backend: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger`

### CORS
Ensure the backend has CORS configured to allow requests from `http://localhost:4200`

### Running the Application

1. Start the backend:
   ```bash
   cd Sanrachna.ai-BE/Sanrachna.Ai
   dotnet run
   ```

2. Start the frontend:
   ```bash
   cd Sanrachna.ai-FE/LoginTerminal
   npm install
   ng serve
   ```

3. Navigate to `http://localhost:4200`

## Error Handling

The frontend handles the following error scenarios:
- **401 Unauthorized**: Attempts token refresh, redirects to login on failure
- **403 Forbidden**: Shows "Access Denied" toast
- **404 Not Found**: Shows appropriate error message
- **500 Server Error**: Shows "Server Error" toast
- **Network Error**: Shows "Network Error" toast

## Security Considerations

1. Tokens stored in localStorage (remember me) or sessionStorage
2. Refresh tokens sent to backend for invalidation on logout
3. Password must contain uppercase, lowercase, and number (min 8 chars)
4. All protected endpoints require `Authorization` header
