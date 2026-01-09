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

---




-----
-----
-------
----------

## 🚀 Creating a New App from This Template

Follow these steps to create a new application using this template:

### Step 1: Copy the Template Folder

```bash
# From the Sanrachna.ai-FE directory
cp -r LoginHeaderAngularTemplate YourNewAppName
cd YourNewAppName
```

### Step 2: Update Files (5 files to change)

#### 📄 File 1: `package.json`

| Line | Property | Change To |
|------|----------|-----------|
| 2 | `"name"` | `"your-new-app-name"` |
| 6 | `"start"` script port | `"ng serve --port 42XX"` |

```json
{
  "name": "your-new-app-name",
  "scripts": {
    "start": "ng serve --port 4205"
  }
}
```

#### 📄 File 2: `angular.json`

| Line | Property | Change To |
|------|----------|-----------|
| 5 | Project key under `"projects"` | `"your-new-app-name"` |
| 86 | `"defaultProject"` | `"your-new-app-name"` |

#### 📄 File 3: `src/app/app.config.ts`

Update the SSO configuration (around line 18-22):

```typescript
const ssoAuthConfig: SsoAuthConfig = {
  loginTerminalUrl: 'http://localhost:4200',     // Keep same
  currentAppUrl: 'http://localhost:4205',        // ← Your new port
  tokenStorageKey: 'yournewapp_auth_token',      // ← Unique key
  userStorageKey: 'yournewapp_user',             // ← Unique key
  enableVisibilityValidation: true,
  enableDebugLogging: true,
  loginPath: '/login',
  logoutPath: '/logout'
};
```

#### 📄 File 4: `src/app/components/header/header.component.ts`

Change the `appName` property (around line 53):

```typescript
appName = 'Your New App Name';
```

#### 📄 File 5: `src/index.html`

Update the title tag (line 6):

```html
<title>Your New App Name</title>
```

### Step 3: Install and Run

```bash
npm install
npm start
```

Your app will be running at `http://localhost:42XX`

---

## 📋 Quick Checklist

Use this checklist when creating a new app:

- [ ] Copy folder and rename
- [ ] `package.json` → Change `name` and `port`
- [ ] `angular.json` → Change project name (2 places)
- [ ] `app.config.ts` → Change `currentAppUrl`, `tokenStorageKey`, `userStorageKey`
- [ ] `header.component.ts` → Change `appName`
- [ ] `index.html` → Change `<title>`
- [ ] Run `npm install`
- [ ] Run `npm start`

---

## 🔌 Port Allocation

| Application | Port |
|-------------|------|
| Login Terminal | 4200 |
| StandBy Habits | 4202 |
| Anti-Goal | 4203 |
| This Template | 4204 |
| **Next Available** | **4205+** |

> ⚠️ Always use a unique port for each application!

---

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
          100: '#e0e7ff',
          // ... customize your colors
        }
      }
    }
  }
}
```

### Adding New Pages

1. Create a component in `src/app/pages/your-page/`
2. Add a route in `src/app/app.routes.ts`:

```typescript
{
  path: 'your-page',
  loadComponent: () => import('./pages/your-page/your-page.component')
    .then(m => m.YourPageComponent)
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server |
| `npm run build` | Build for production |
| `npm run watch` | Build and watch for changes |

## SSO Authentication Flow

1. User visits your app → Redirected to Login Terminal (port 4200)
2. User logs in → Redirected back with JWT token in URL
3. App extracts token → Stores in localStorage
4. User is now authenticated across all SSO apps

## License

Internal use only - Sanrachna.AI
