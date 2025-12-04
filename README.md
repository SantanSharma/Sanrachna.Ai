# Sanrachna.AI - Project Documentation

**Last Updated**: December 4, 2025  
**Framework**: ASP.NET Core 7.0 + Angular 15  
**Architecture**: Single Page Application (SPA) with Backend API

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Application Flow](#architecture--application-flow)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [How to Run the Application](#how-to-run-the-application)
6. [Development Workflow](#development-workflow)
7. [Key Components](#key-components)
8. [Configuration Files](#configuration-files)
9. [Future Updates & Change Log](#future-updates--change-log)

---

## Project Overview

Sanrachna.AI is an ASP.NET Core web application with an Angular frontend. It follows the **SPA (Single Page Application)** architecture where:
- The **backend** (ASP.NET Core) serves as a REST API and hosts the application
- The **frontend** (Angular) provides the user interface and consumes the API
- Both are integrated into a single deployable unit

---

## Architecture & Application Flow

### How the Application Works

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                            │
│                   (http://localhost)                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               ASP.NET Core Backend                          │
│            (https://localhost:7049)                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Program.cs - Application Entry Point                │  │
│  │  • Configures services                               │  │
│  │  • Sets up routing                                   │  │
│  │  • Serves static files (Angular build)               │  │
│  │  • Configures SPA proxy for development              │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Controllers (API Endpoints)                         │  │
│  │  • WeatherForecastController.cs                      │  │
│  │    - Route: /weatherforecast                         │  │
│  │    - Returns JSON data                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ API Calls (via HTTP)
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Angular Frontend (ClientApp)                   │
│            (https://localhost:44403)                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  App Module (app.module.ts)                          │  │
│  │  • Defines routes                                    │  │
│  │  • Registers components                              │  │
│  │  • Configures HTTP client                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Components (UI Pages)                               │  │
│  │  • HomeComponent - Landing page                      │  │
│  │  • CounterComponent - Counter demo                   │  │
│  │  • FetchDataComponent - Fetches from API             │  │
│  │  • NavMenuComponent - Navigation bar                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Proxy Configuration (proxy.conf.js)                 │  │
│  │  • Forwards /weatherforecast to backend              │  │
│  │  • Enables seamless API communication                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow Example

1. **User navigates to `/fetch-data`**
   - Angular Router loads `FetchDataComponent`

2. **Component makes API call**
   - `FetchDataComponent` uses HttpClient to call `/weatherforecast`
   - During development, proxy.conf.js forwards this to the backend

3. **Backend processes request**
   - `WeatherForecastController` receives the request
   - Generates random weather data
   - Returns JSON response

4. **Frontend displays data**
   - Angular component receives data
   - Updates the view with the weather forecast

---

## Technology Stack

### Backend
- **Framework**: ASP.NET Core 7.0
- **Language**: C# with implicit usings enabled
- **Architecture**: MVC pattern with Controllers

### Frontend
- **Framework**: Angular 15.2.8
- **Language**: TypeScript 4.9.5
- **UI Library**: Bootstrap 5.2.3
- **Build Tool**: Angular CLI

### Integration
- **SPA Proxy**: Microsoft.AspNetCore.SpaProxy (for development)
- **Communication**: REST API (JSON over HTTP)

---

## Project Structure

```
Sanrachna.Ai/
│
├── Program.cs                    # Application entry point & configuration
├── Sanrachna.Ai.csproj          # .NET project file with SPA integration
├── appsettings.json             # Application configuration
├── appsettings.Development.json # Development-specific settings
├── WeatherForecast.cs           # Data model
│
├── Controllers/
│   └── WeatherForecastController.cs  # API controller
│
├── Pages/                       # Razor pages (fallback/error pages)
│   ├── Error.cshtml
│   └── _ViewImports.cshtml
│
├── Properties/
│   └── launchSettings.json      # Launch profiles & ports
│
├── wwwroot/                     # Static files (production Angular build)
│
├── ClientApp/                   # Angular application
│   ├── package.json             # Node dependencies
│   ├── angular.json             # Angular CLI configuration
│   ├── proxy.conf.js            # API proxy for development
│   ├── tsconfig.json            # TypeScript configuration
│   │
│   └── src/
│       ├── index.html           # Main HTML file
│       ├── main.ts              # Angular bootstrap
│       ├── styles.css           # Global styles
│       │
│       └── app/
│           ├── app.module.ts              # Root module
│           ├── app.component.ts           # Root component
│           ├── nav-menu/                  # Navigation component
│           ├── home/                      # Home page
│           ├── counter/                   # Counter demo page
│           └── fetch-data/                # API integration demo
│
├── bin/                         # Build output
└── obj/                         # Intermediate build files
```

---

## How to Run the Application

### **IMPORTANT: You Only Need to Run ONE Command!**

This project uses **ASP.NET Core SPA Proxy** which automatically manages both the backend and frontend in development mode.

### Single Command Approach (Recommended)

```bash
# Navigate to the project root
cd /Users/santan/workspace/Sanrachna.AI/Main_App/Azure_Learing_Sanrachna_AI_v1/Sanrachna.Ai

# Run this single command
dotnet run
```

**What happens behind the scenes:**
1. ASP.NET Core backend starts on `https://localhost:7049`
2. SpaProxy automatically runs `npm start` in the ClientApp folder
3. Angular dev server starts on `https://localhost:44403`
4. Backend serves the Angular app and proxies API requests
5. You access everything through: **https://localhost:7049**

### Manual Approach (Not Recommended for Development)

If you need to run them separately for debugging:

**Terminal 1 - Backend:**
```bash
cd /Users/santan/workspace/Sanrachna.AI/Main_App/Azure_Learing_Sanrachna_AI_v1/Sanrachna.Ai
dotnet run
```

**Terminal 2 - Frontend:**
```bash
cd /Users/santan/workspace/Sanrachna.AI/Main_App/Azure_Learing_Sanrachna_AI_v1/Sanrachna.Ai/ClientApp
npm start
```

---

## Development Workflow

### First Time Setup

1. **Install Prerequisites**
   - .NET 7.0 SDK
   - Node.js (v16 or higher)
   - npm (comes with Node.js)

2. **Restore Dependencies**
   ```bash
   # .NET packages (in project root)
   dotnet restore
   
   # Node packages (in ClientApp)
   cd ClientApp
   npm install
   ```

3. **Run the Application**
   ```bash
   # From project root
   dotnet run
   ```

### Development Mode Features

- **Hot Module Replacement (HMR)**: Angular changes reload automatically
- **API Proxy**: Frontend calls to `/weatherforecast` are automatically forwarded to the backend
- **HTTPS**: SSL certificates are automatically configured
- **Error Pages**: Friendly error pages in development

### Building for Production

```bash
# Builds both backend and frontend
dotnet publish -c Release -o ./publish

# What it does:
# 1. Runs npm install in ClientApp
# 2. Runs ng build --configuration production
# 3. Copies Angular build to wwwroot
# 4. Compiles .NET application
```

---

## Key Components

### Backend Components

#### 1. **Program.cs**
- **Purpose**: Application startup and configuration
- **Key responsibilities**:
  - Configures dependency injection
  - Sets up HTTP request pipeline
  - Configures routing
  - Serves static files from wwwroot
  - Maps fallback to index.html (SPA routing)

#### 2. **WeatherForecastController.cs**
- **Route**: `/weatherforecast`
- **HTTP Method**: GET
- **Purpose**: Demonstrates API endpoint
- **Returns**: Array of 5 random weather forecasts

### Frontend Components

#### 1. **AppModule (app.module.ts)**
- **Purpose**: Root module that bootstraps the application
- **Defines**:
  - Application routes
  - Component declarations
  - Service providers
  - Imports (HttpClient, FormsModule, etc.)

#### 2. **HomeComponent**
- **Route**: `/` (default)
- **Purpose**: Landing page/welcome screen

#### 3. **CounterComponent**
- **Route**: `/counter`
- **Purpose**: Simple counter demo (client-side state)

#### 4. **FetchDataComponent**
- **Route**: `/fetch-data`
- **Purpose**: Demonstrates API integration
- **Functionality**: Fetches and displays weather data from backend API

#### 5. **NavMenuComponent**
- **Purpose**: Navigation bar across all pages
- **Location**: Shared component

---

## Configuration Files

### Backend Configuration

#### **Sanrachna.Ai.csproj**
```xml
<SpaRoot>ClientApp\</SpaRoot>
<SpaProxyServerUrl>https://localhost:44403</SpaProxyServerUrl>
<SpaProxyLaunchCommand>npm start</SpaProxyLaunchCommand>
```
- Defines Angular app location
- Configures SPA proxy settings
- Automates npm install and build process

#### **launchSettings.json**
- Defines launch profiles
- Backend URLs: `https://localhost:7049` and `http://localhost:5099`
- Enables SPA proxy through environment variable

#### **appsettings.json**
- Application-wide configuration
- Can add connection strings, logging settings, etc.

### Frontend Configuration

#### **package.json**
```json
"scripts": {
  "start": "run-script-os",
  "start:default": "ng serve --port 44403 --ssl --ssl-cert ..."
}
```
- Defines npm scripts
- Configures SSL certificates for HTTPS
- Uses OS-specific commands (macOS vs Windows)

#### **proxy.conf.js**
```javascript
context: ["/weatherforecast"]
target: "https://localhost:7049"
```
- Forwards API requests to backend during development
- Eliminates CORS issues

#### **angular.json**
- Angular CLI configuration
- Build settings
- Output paths
- Asset management

#### **tsconfig.json**
- TypeScript compiler options
- Module resolution settings
- Target ES version

---

## Future Updates & Change Log

### Version History

#### v1.0.0 - Initial Setup (December 4, 2025)
- **Architecture**: ASP.NET Core 7.0 + Angular 15 SPA
- **Features**:
  - Basic project structure
  - Weather forecast API demo
  - Angular routing with 3 pages
  - SPA proxy configuration
  - HTTPS support
- **Components**:
  - HomeComponent
  - CounterComponent
  - FetchDataComponent
  - WeatherForecastController API

#### v1.0.1 - Fixed 504 Gateway Timeout (December 4, 2025)
- **Issue**: Getting 504 Gateway Timeout when accessing `/weatherforecast`
- **Root Cause**: Angular dev server running on port 44403 without backend API running
- **Solution**: 
  - Must run `dotnet run` from project root (NOT `ng serve` from ClientApp)
  - Backend automatically manages both services via SPA Proxy
  - Access application via `https://localhost:7049` (backend port)
- **Key Learning**: Never run Angular independently during development; let ASP.NET Core manage it

---

### Planned Updates
*This section will be updated as new features are implemented*

---

## Development Notes

### Port Configuration
- **Backend (ASP.NET Core)**: `https://localhost:7049` (primary), `http://localhost:5099` (alternative)
- **Frontend Dev Server (Angular)**: `https://localhost:44403`
- **Access URL**: Always use `https://localhost:7049` (backend serves frontend)

### SSL Certificates
- Automatically managed by ASP.NET Core and Angular
- Located in `~/.aspnet/https/` on macOS
- Generated through `dotnet dev-certs https`

### API Integration Pattern
```typescript
// In Angular components
constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
  http.get<DataType>(baseUrl + 'api-endpoint').subscribe(...)
}
```

### Adding New API Endpoints
1. Create controller in `Controllers/` folder
2. Add route attribute: `[Route("[controller]")]`
3. Add to proxy.conf.js if needed
4. Create Angular service to consume the API

### Adding New Angular Components
```bash
cd ClientApp/src/app
ng generate component component-name
```
Then register in `app.module.ts` and add route if needed.

---

## Troubleshooting

### Common Issues

**Issue**: "504 Gateway Timeout" when accessing API endpoints
- **Cause**: Running `ng serve` independently without the backend running
- **Solution**: 
  1. Stop the Angular dev server (Ctrl+C)
  2. Navigate to project root: `cd /Users/santan/workspace/Sanrachna.AI/Main_App/Azure_Learing_Sanrachna_AI_v1/Sanrachna.Ai`
  3. Run `dotnet run` - this starts BOTH backend and frontend
  4. Access via `https://localhost:7049` (NOT 44403)
- **Prevention**: Always use `dotnet run` from project root for development

**Issue**: "Address already in use" error on ports 7049 or 44403
- **Solution**: 
  ```bash
  # Find and kill processes on port 7049
  lsof -ti:7049 | xargs kill -9
  
  # Find and kill processes on port 44403
  lsof -ti:44403 | xargs kill -9
  
  # Then run
  dotnet run
  ```

**Issue**: "Node.js is required to build and run this project"
- **Solution**: Install Node.js from https://nodejs.org/

**Issue**: Angular dev server doesn't start
- **Solution**: Run `npm install` in ClientApp folder

**Issue**: HTTPS certificate errors
- **Solution**: Run `dotnet dev-certs https --trust`

---

## Contact & Contributions

This is a learning project for Azure and modern web development with Sanrachna.AI.

**Project Owner**: Santan  
**Purpose**: Azure learning and AI application development

---

*This README will be continuously updated as the project evolves. Always refer to this document for the latest architecture and configuration details.*
