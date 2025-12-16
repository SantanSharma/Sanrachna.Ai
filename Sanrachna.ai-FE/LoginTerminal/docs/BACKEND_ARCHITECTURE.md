# LoginTerminal - Backend Architecture Design

## Overview

This document outlines the backend architecture for the **LoginTerminal** centralized SSO-based login system using ASP.NET Core Web API.

---

## 1. Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | ASP.NET Core 8.0 Web API |
| Authentication | JWT (JSON Web Tokens) |
| ORM | Entity Framework Core 8.0 |
| Database | SQL Server 2022 |
| Caching | Redis (optional) |
| Logging | Serilog |
| API Documentation | Swagger/OpenAPI |
| Testing | xUnit, Moq |

---

## 2. Project Structure

```
LoginTerminal.API/
├── Controllers/
│   ├── AuthController.cs
│   ├── UsersController.cs
│   └── ApplicationsController.cs
├── Models/
│   ├── Entities/
│   │   ├── User.cs
│   │   ├── Role.cs
│   │   ├── Application.cs
│   │   ├── UserApplication.cs
│   │   ├── UserSession.cs
│   │   ├── RefreshToken.cs
│   │   └── AuditLog.cs
│   ├── DTOs/
│   │   ├── Auth/
│   │   │   ├── LoginRequestDto.cs
│   │   │   ├── RegisterRequestDto.cs
│   │   │   ├── AuthResponseDto.cs
│   │   │   └── TokenRefreshRequestDto.cs
│   │   ├── User/
│   │   │   ├── UserDto.cs
│   │   │   ├── UserUpdateDto.cs
│   │   │   └── PasswordChangeDto.cs
│   │   └── Application/
│   │       ├── ApplicationDto.cs
│   │       └── ApplicationAccessDto.cs
│   └── Common/
│       ├── ApiResponse.cs
│       └── PaginatedResult.cs
├── Services/
│   ├── Interfaces/
│   │   ├── IAuthService.cs
│   │   ├── IUserService.cs
│   │   ├── IApplicationService.cs
│   │   ├── ITokenService.cs
│   │   └── IAuditService.cs
│   └── Implementations/
│       ├── AuthService.cs
│       ├── UserService.cs
│       ├── ApplicationService.cs
│       ├── TokenService.cs
│       └── AuditService.cs
├── Data/
│   ├── AppDbContext.cs
│   ├── Configurations/
│   │   ├── UserConfiguration.cs
│   │   ├── RoleConfiguration.cs
│   │   ├── ApplicationConfiguration.cs
│   │   └── ...
│   └── Migrations/
├── Middleware/
│   ├── JwtMiddleware.cs
│   ├── ExceptionMiddleware.cs
│   └── RequestLoggingMiddleware.cs
├── Helpers/
│   ├── PasswordHasher.cs
│   ├── JwtHelper.cs
│   └── Extensions.cs
└── Program.cs
```

---

## 3. API Endpoints Design

### 3.1 Authentication APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login with email/password | No |
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/google-login` | OAuth login with Google | No |
| POST | `/api/auth/refresh-token` | Refresh access token | No |
| POST | `/api/auth/logout` | Logout and invalidate tokens | Yes |
| GET | `/api/auth/validate-token` | Validate current token | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |

#### Request/Response Examples:

**POST /api/auth/login**
```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": true
}

// Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
    "expiresAt": "2024-12-14T12:00:00Z",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

### 3.2 User APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/me` | Get current user profile | Yes |
| GET | `/api/users/{id}` | Get user by ID (Admin) | Yes (Admin) |
| PUT | `/api/users/{id}` | Update user profile | Yes |
| DELETE | `/api/users/{id}` | Delete user (Admin) | Yes (Admin) |
| PUT | `/api/users/{id}/password` | Change password | Yes |
| GET | `/api/users` | List all users (Admin) | Yes (Admin) |

### 3.3 Application Access APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/apps` | List all applications | Yes |
| GET | `/api/apps/{id}` | Get application details | Yes |
| GET | `/api/apps/user/{userId}` | Get user's accessible apps | Yes |
| POST | `/api/apps/assign` | Assign app access to user | Yes (Admin) |
| DELETE | `/api/apps/revoke` | Revoke app access | Yes (Admin) |
| POST | `/api/apps` | Create new application | Yes (Admin) |
| PUT | `/api/apps/{id}` | Update application | Yes (Admin) |
| DELETE | `/api/apps/{id}` | Delete application | Yes (Admin) |

---

## 4. Entity Models

### 4.1 User Entity

```csharp
public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public bool EmailConfirmed { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    
    // Navigation Properties
    public int RoleId { get; set; }
    public Role Role { get; set; } = null!;
    public ICollection<UserApplication> UserApplications { get; set; } = new List<UserApplication>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<UserSession> Sessions { get; set; } = new List<UserSession>();
}
```

### 4.2 Role Entity

```csharp
public class Role
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsSystemRole { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation Properties
    public ICollection<User> Users { get; set; } = new List<User>();
}
```

### 4.3 Application Entity

```csharp
public class Application
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string IconColor { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool IsSupported { get; set; } = true;
    public bool RequiresAuth { get; set; } = true;
    public int DisplayOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation Properties
    public ICollection<UserApplication> UserApplications { get; set; } = new List<UserApplication>();
}
```

### 4.4 UserApplication (Many-to-Many Mapping)

```csharp
public class UserApplication
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ApplicationId { get; set; }
    public DateTime GrantedAt { get; set; } = DateTime.UtcNow;
    public int? GrantedByUserId { get; set; }
    
    // Navigation Properties
    public User User { get; set; } = null!;
    public Application Application { get; set; } = null!;
    public User? GrantedByUser { get; set; }
}
```

### 4.5 RefreshToken Entity

```csharp
public class RefreshToken
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAt { get; set; }
    public string? RevokedByIp { get; set; }
    public string? ReplacedByToken { get; set; }
    public string CreatedByIp { get; set; } = string.Empty;
    
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsRevoked => RevokedAt != null;
    public bool IsActive => !IsRevoked && !IsExpired;
    
    // Navigation Properties
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
```

### 4.6 UserSession Entity

```csharp
public class UserSession
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string SessionToken { get; set; } = string.Empty;
    public string? DeviceInfo { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime? LastActivityAt { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation Properties
    public User User { get; set; } = null!;
}
```

### 4.7 AuditLog Entity

```csharp
public class AuditLog
{
    public long Id { get; set; }
    public int? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public int? EntityId { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    // Navigation Properties
    public User? User { get; set; }
}
```

---

## 5. JWT Configuration

### 5.1 Token Settings

```csharp
public class JwtSettings
{
    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int AccessTokenExpirationMinutes { get; set; } = 60;
    public int RefreshTokenExpirationDays { get; set; } = 7;
}
```

### 5.2 Token Service Implementation

```csharp
public interface ITokenService
{
    string GenerateAccessToken(User user);
    RefreshToken GenerateRefreshToken(string ipAddress);
    ClaimsPrincipal? ValidateToken(string token);
}
```

---

## 6. Middleware

### 6.1 JWT Middleware

- Validates JWT tokens on each request
- Extracts user claims and attaches to HttpContext
- Handles token expiration gracefully

### 6.2 Exception Handling Middleware

- Global exception handling
- Consistent error response format
- Logging of all exceptions

### 6.3 Request Logging Middleware

- Logs all incoming requests
- Captures request/response metrics
- Performance monitoring

---

## 7. Security Considerations

### 7.1 Password Security
- BCrypt hashing with salt
- Minimum password requirements (8 chars, mixed case, numbers)
- Password history tracking (optional)

### 7.2 Token Security
- Short-lived access tokens (1 hour)
- Refresh token rotation
- Token revocation on logout
- Secure token storage recommendations

### 7.3 Rate Limiting
- Login attempts: 5 per minute per IP
- API requests: 100 per minute per user
- Registration: 3 per hour per IP

### 7.4 CORS Configuration
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowedOrigins", policy =>
    {
        policy.WithOrigins(
            "http://localhost:4200",
            "https://login.sanrachna.com"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});
```

---

## 8. SSO Flow

### 8.1 Authentication Flow

```
1. User logs in to LoginTerminal
2. Server validates credentials
3. Server generates JWT + Refresh Token
4. Client stores tokens (localStorage/sessionStorage)
5. Client redirects to target app with token
6. Target app validates token with LoginTerminal API
7. Target app creates local session
```

### 8.2 Token Refresh Flow

```
1. Client detects token expiration
2. Client sends refresh token to /api/auth/refresh-token
3. Server validates refresh token
4. Server generates new access token + rotates refresh token
5. Client updates stored tokens
```

---

## 9. Deployment Considerations

### 9.1 Environment Configuration
- Development, Staging, Production configurations
- Secrets management with Azure Key Vault
- Environment-specific connection strings

### 9.2 Scalability
- Stateless API design for horizontal scaling
- Redis for distributed caching
- Database connection pooling

### 9.3 Monitoring
- Application Insights integration
- Health check endpoints
- Performance metrics dashboard

---

## 10. Future Enhancements

1. **Multi-Factor Authentication (MFA)**
   - TOTP-based 2FA
   - SMS verification
   - Email verification codes

2. **OAuth 2.0 Providers**
   - Google
   - Microsoft
   - GitHub

3. **Advanced Session Management**
   - Device tracking
   - Session invalidation
   - Concurrent session limits

4. **Microservices Ready**
   - API Gateway integration
   - Service-to-service authentication
   - Event-driven architecture

---

*Document Version: 1.0*
*Last Updated: December 2024*
