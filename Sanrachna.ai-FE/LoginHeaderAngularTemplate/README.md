# LoginHeaderAngularTemplate

A sample Angular 18 application template with SSO (Single Sign-On) authentication header.

## Features

- ✅ **SSO Authentication** - Pre-configured integration with Login Terminal
- ✅ **User Profile Dropdown** - Shows authenticated user with logout option
- ✅ **Tailwind CSS** - Modern utility-first CSS framework
- ✅ **Angular 18** - Latest Angular with standalone components
- ✅ **TypeScript Strict Mode** - Enhanced type safety
- ✅ **Dark Theme** - Modern dark UI theme

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Login Terminal running on port 4200

### Installation

```bash
# Navigate to the app directory
cd Sanrachna.ai-FE/LoginHeaderAngularTemplate

# Install dependencies
npm install

# Start the development server
npm start
```

The app will be available at `http://localhost:4204`

## Project Structure

```
LoginHeaderAngularTemplate/
├── src/
│   ├── app/
│   │   ├── components/         # Shared components
│   │   │   └── header/         # App header with user dropdown
│   │   ├── core/               # Core module (SSO auth)
│   │   │   ├── auth/           # SSO authentication service
│   │   │   └── components/     # User profile dropdown
│   │   ├── pages/              # Page components
│   │   │   └── home/           # Home page
│   │   ├── app.component.ts    # Root component
│   │   ├── app.config.ts       # App configuration (SSO config)
│   │   └── app.routes.ts       # Route definitions
│   ├── index.html              # HTML entry point
│   ├── main.ts                 # Angular bootstrap
│   └── styles.scss             # Global styles
├── angular.json                # Angular CLI config
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind CSS config
└── tsconfig.json               # TypeScript config
```

## Configuration

### SSO Settings

Edit `src/app/app.config.ts` to configure SSO:

```typescript
const ssoAuthConfig: SsoAuthConfig = {
  loginTerminalUrl: 'http://localhost:4200',  // Login Terminal URL
  currentAppUrl: 'http://localhost:4204',     // This app's URL
  tokenStorageKey: 'template_auth_token',     // Token storage key
  userStorageKey: 'template_user',            // User storage key
  enableVisibilityValidation: true,           // Auto-validate on focus
  enableDebugLogging: true,                   // Debug logging
};
```

### App Name

Edit `src/app/components/header/header.component.ts`:

```typescript
appName = 'Your App Name';
```

## Customization

### Colors

Edit `tailwind.config.js` to customize the app color scheme:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        app: {
          50: '#eef2ff',
          // ... customize your colors
        }
      }
    }
  }
}
```

### Adding New Pages

1. Create a component in `src/app/pages/`
2. Add a route in `src/app/app.routes.ts`

## Reusing This Template

To create a new app from this template:

1. Copy the `LoginHeaderAngularTemplate` folder
2. Rename it to your app name
3. Update `package.json`:
   - Change `name` to your app name
   - Update port in `start` script
4. Update `angular.json` project name
5. Update `app.config.ts` with new SSO settings
6. Update header `appName` to your app name

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server on port 4204 |
| `npm run build` | Build for production |
| `npm run watch` | Build and watch for changes |

## Port Allocation

This app runs on port **4204** by default. Other apps:

- Login Terminal: 4200
- StandBy Habits: 4202
- Anti-Goal: 4203
- **This Template: 4204**

## License

Internal use only.
