# Sanrachna.Ai Backend API

A centralized SSO-based authentication API built with ASP.NET Core 7.0.

## Overview

This API provides authentication and authorization services for the Sanrachna.AI ecosystem, supporting:
- User registration and login
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Application access management
- Audit logging

## Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | ASP.NET Core 7.0 Web API |
| Authentication | JWT (JSON Web Tokens) |
| ORM | Entity Framework Core 7.0 |
| Database | SQL Server |
| Logging | Serilog |
| API Documentation | Swagger/OpenAPI |

## Getting Started

### Prerequisites

- .NET 7.0 SDK or later
- SQL Server (local or remote)
- Visual Studio 2022 / VS Code / Rider

### Configuration

1. Update the connection string in `appsettings.json` or `appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=your-server;Database=SanrachnaAi;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

2. Configure JWT settings:
```json
{
  "JwtSettings": {
    "SecretKey": "YourSecretKeyAtLeast32CharactersLong!",
    "Issuer": "Sanrachna.Ai",
    "Audience": "Sanrachna.Ai.Users",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  }
}
```

### Database Setup

Run EF Core migrations to create the database:
```bash
cd Sanrachna.Ai
dotnet ef database update
```

### Running the Application

```bash
dotnet run
```

The API will be available at `http://localhost:5000` with Swagger UI at the root URL.

## API Endpoints

### Authentication APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/refresh-token` | Refresh access token | No |
| POST | `/api/auth/logout` | Logout and invalidate tokens | Yes |
| GET | `/api/auth/validate-token` | Validate current token | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password | No |

### User APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/me` | Get current user profile | Yes |
| GET | `/api/users/{id}` | Get user by ID | Yes (Admin) |
| GET | `/api/users` | List all users | Yes (Admin) |
| PUT | `/api/users/{id}` | Update user profile | Yes |
| DELETE | `/api/users/{id}` | Delete user | Yes (Admin) |
| PUT | `/api/users/{id}/password` | Change password | Yes |

### Application APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/apps` | List all applications | Yes |
| GET | `/api/apps/{id}` | Get application details | Yes |
| GET | `/api/apps/my` | Get current user's apps | Yes |
| GET | `/api/apps/user/{userId}` | Get user's apps | Yes |
| POST | `/api/apps` | Create application | Yes (Admin) |
| PUT | `/api/apps/{id}` | Update application | Yes (Admin) |
| DELETE | `/api/apps/{id}` | Delete application | Yes (Admin) |
| POST | `/api/apps/assign` | Assign app access | Yes (Admin) |
| DELETE | `/api/apps/revoke` | Revoke app access | Yes (Admin) |

## Testing with Postman

### 1. Register a New User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

### 2. Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password123!",
  "rememberMe": true
}
```

### 3. Use the Token
Add the returned token to subsequent requests:
```
Authorization: Bearer <your-jwt-token>
```

## Project Structure

```
Sanrachna.Ai/
├── Controllers/
│   ├── AuthController.cs
│   ├── UsersController.cs
│   └── ApplicationsController.cs
├── Models/
│   ├── Entities/
│   ├── DTOs/
│   └── Common/
├── Services/
│   ├── Interfaces/
│   └── Implementations/
├── Data/
│   ├── AppDbContext.cs
│   ├── Configurations/
│   └── Migrations/
├── Middleware/
│   ├── ExceptionMiddleware.cs
│   └── RequestLoggingMiddleware.cs
├── Helpers/
│   └── JwtSettings.cs
├── Program.cs
├── appsettings.json
└── appsettings.Development.json
```

## Security Features

- BCrypt password hashing
- JWT with configurable expiration
- Refresh token rotation
- Role-based authorization
- CORS configuration
- Request logging and audit trail

## License

© 2024 Sanrachna.AI. All rights reserved.