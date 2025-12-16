# LoginTerminal - Sanrachna Portal

A centralized SSO-based Login System that authenticates users once and allows seamless access to multiple applications based on permissions.

![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)

## 📸 Screenshots

| Login | Dashboard | Settings | Logout |
|-------|-----------|----------|--------|
| Dark themed login with gradient buttons | Application cards with categories | Profile, Password, Appearance tabs | Confirmation with user info |

## ✨ Features

### Frontend (Angular)
- 🔐 **JWT-based Authentication** with token persistence
- 🌓 **Dark Theme UI** matching provided designs
- 📱 **Responsive Design** with Tailwind CSS
- 🔄 **Reactive State Management** using Angular Signals
- 🛡️ **Route Guards** for protected routes
- 🔗 **HTTP Interceptors** for automatic token attachment
- 🚀 **Lazy Loading** for optimized bundle size
- 🎨 **Toast Notifications** for user feedback
- 🔍 **Application Search & Filtering**
- 📊 **Grid/List View Toggle**

### Backend Architecture (Designed)
- ASP.NET Core Web API
- JWT Authentication with Refresh Tokens
- Entity Framework Core with SQL Server
- Role-based Access Control
- Audit Logging
- Session Management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Angular CLI 19+

### Installation

```bash
# Navigate to project directory
cd LoginTerminal

# Install dependencies
npm install

# Start development server
ng serve
```

### Development Server

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload on source changes.

### Build

```bash
# Development build
ng build

# Production build
ng build --configuration production
```

## 📁 Project Structure

```
LoginTerminal/
├── src/
│   ├── app/
│   │   ├── core/                    # Core functionality
│   │   │   ├── guards/              # Route guards
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── guest.guard.ts
│   │   │   ├── interceptors/        # HTTP interceptors
│   │   │   │   └── auth.interceptor.ts
│   │   │   ├── models/              # TypeScript interfaces
│   │   │   │   ├── user.model.ts
│   │   │   │   ├── application.model.ts
│   │   │   │   └── common.model.ts
│   │   │   └── services/            # Core services
│   │   │       ├── auth.service.ts
│   │   │       ├── theme.service.ts
│   │   │       └── toast.service.ts
│   │   ├── features/                # Feature modules
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── logout/
│   │   │   ├── dashboard/
│   │   │   └── settings/
│   │   ├── shared/                  # Shared components
│   │   │   └── components/
│   │   │       ├── navbar/
│   │   │       ├── toast/
│   │   │       └── app-icon/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── styles.css                   # Global styles with Tailwind
│   ├── index.html
│   └── main.ts
├── docs/                            # Documentation
│   ├── BACKEND_ARCHITECTURE.md
│   └── DATABASE_SCHEMA.md
├── angular.json
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🔐 Authentication Flow

### Login Flow
1. User enters credentials on login page
2. Credentials sent to AuthService
3. JWT token received and stored
4. User redirected to dashboard
5. Token attached to all subsequent requests

### SSO Flow
1. User clicks application on dashboard
2. Token retrieved from storage
3. Redirect to target app with token
4. Target app validates token with API
5. User gains access without re-login

### Token Persistence
- **Remember Me enabled**: Token stored in `localStorage`
- **Remember Me disabled**: Token stored in `sessionStorage`

## 🎨 Theming

The application uses a custom dark theme with Tailwind CSS:

```javascript
// tailwind.config.js
colors: {
  'dark-bg': '#0f172a',
  'dark-card': '#1e293b',
  'dark-border': '#334155',
  'dark-input': '#1e293b',
  'primary': '#3b82f6',
  'accent-purple': '#8b5cf6',
}
```

## 📚 API Integration

The frontend is designed to work with mock data for development. In production, update the `environment.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.sanrachna.com/api',
  // ...
};
```

### Expected API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User authentication |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/logout` | Session termination |
| GET | `/api/apps/user/{id}` | User's accessible apps |
| PUT | `/api/users/{id}` | Update user profile |

## 🔧 Configuration

### Environment Variables

Configure in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  auth: {
    tokenKey: 'lt_auth_token',
    tokenExpiry: 3600,
  },
  features: {
    googleLogin: true,
    rememberMe: true,
  }
};
```

## 📖 Documentation

- [Backend Architecture](./docs/BACKEND_ARCHITECTURE.md) - ASP.NET Core API design
- [Database Schema](./docs/DATABASE_SCHEMA.md) - SQL Server schema with stored procedures

## 🧪 Testing

```bash
# Run unit tests
ng test

# Run e2e tests
ng e2e
```

## 🚀 Deployment

### Docker

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/login-terminal/browser /usr/share/nginx/html
EXPOSE 80
```

### Azure Static Web Apps

```yaml
# .github/workflows/azure-static-web-apps.yml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches: [main]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          app_location: "/"
          output_location: "dist/login-terminal/browser"
```

## 📄 License

This project is proprietary software for Sanrachna.AI.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ by Sanrachna.AI Team**
