# Azure App Service Deployment Guide for Sanrachna.Ai Backend

> **Last Updated**: December 29, 2025  
> **Tested & Working**: ✅

---

## 🌐 Current Azure Resources

| Resource | Name | URL |
|----------|------|-----|
| **API (Main)** | `sanrachna-ai-api-dev` | https://sanrachna-ai-api-dev-dshsc6dce7avf9c7.southindia-01.azurewebsites.net |
| **Resource Group** | `rg-azure-sanrachna-ai` | South India |
| **MySQL Database** | `dev-sanrachna.mysql.database.azure.com` | Azure MySQL Flexible Server |

---

## 🚀 Quick Deployment (Tested & Working)

### Prerequisites
1. **Azure CLI** installed (`winget install -e --id Microsoft.AzureCLI`)
2. **.NET 8 SDK** installed
3. **Azure subscription** with App Service created

### Step-by-Step Deployment

```powershell
# 1. Navigate to project folder
cd E:\code_with_santan\Sanrachna.Ai-main\Sanrachna.Ai-main\Sanrachna.ai-BE\Sanrachna.Ai

# 2. Build and publish the application
dotnet publish -c Release -o ./publish

# 3. Create deployment zip
Compress-Archive -Path "./publish/*" -DestinationPath "./publish.zip" -Force

# 4. Login to Azure (use device code for MFA)
az login --use-device-code

# 5. Deploy to App Service
az webapp deploy --resource-group rg-azure-sanrachna-ai --name sanrachna-ai-api-dev --src-path "./publish.zip" --type zip

# 6. Verify deployment
Invoke-RestMethod -Uri "https://sanrachna-ai-api-dev-dshsc6dce7avf9c7.southindia-01.azurewebsites.net/health"
```

---

## 🔐 App Settings Configuration

### ⚠️ CRITICAL: Correct Setting Names

Use `__` (double underscore) for nested JSON properties. **Wrong names will cause failures!**

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `DefaultConnection` | `ConnectionStrings__DefaultConnection` |
| `JwtSettings:SecretKey` | `JwtSettings__SecretKey` |

### App Service Settings (`sanrachna-ai-api-dev`)

| Setting Name | Value |
|--------------|-------|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ConnectionStrings__DefaultConnection` | `Server=dev-sanrachna.mysql.database.azure.com;Port=3306;Database=sanrachna_ai;User=sanrachnadb;Password=YOUR_PASSWORD;SslMode=Required;` |
| `JwtSettings__SecretKey` | `YOUR_64_CHAR_SECRET_KEY` |
| `JwtSettings__Issuer` | `Sanrachna.Ai.Dev` |
| `JwtSettings__Audience` | `Sanrachna.Ai.Users.Dev` |
| `GoogleSettings__ClientId` | `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` |
| `GoogleSettings__ClientSecret` | `YOUR_GOOGLE_SECRET` |
| `CorsOrigins__0` | `https://sanrachna.space` |
| `CorsOrigins__1` | `https://ltscan.netlify.app` |
| `CorsOrigins__2` | `http://localhost:4200` |

### Set App Settings via CLI

```powershell
# Set all settings
az webapp config appsettings set `
  --resource-group rg-azure-sanrachna-ai `
  --name sanrachna-ai-api-dev `
  --settings `
    ASPNETCORE_ENVIRONMENT=Production `
    "JwtSettings__Issuer=Sanrachna.Ai.Dev" `
    "JwtSettings__Audience=Sanrachna.Ai.Users.Dev"
```

---

## ⚠️ Common Issues & Fixes

### Issue 1: 401 Unauthorized - JWT Audience Invalid

**Error**: `The audience 'Sanrachna.Ai.Users.Dev' is invalid`

**Cause**: JWT token was generated with different Issuer/Audience than Azure expects.

**Fix**: Ensure `JwtSettings__Issuer` and `JwtSettings__Audience` in Azure match your token:
- Use `Sanrachna.Ai.Dev` / `Sanrachna.Ai.Users.Dev` (matches local dev tokens)

```powershell
az webapp config appsettings set --resource-group rg-azure-sanrachna-ai --name sanrachna-ai-api-dev --settings "JwtSettings__Issuer=Sanrachna.Ai.Dev" "JwtSettings__Audience=Sanrachna.Ai.Users.Dev"
```

### Issue 2: Database Not Configured

**Error**: Health check shows `databaseConfigured: false`

**Cause**: Wrong setting name used (`DefaultConnection` instead of `ConnectionStrings__DefaultConnection`)

**Fix**: 
```powershell
az webapp config appsettings set --resource-group rg-azure-sanrachna-ai --name sanrachna-ai-api-dev --settings "ConnectionStrings__DefaultConnection=Server=dev-sanrachna.mysql.database.azure.com;Port=3306;Database=sanrachna_ai;User=sanrachnadb;Password=YOUR_PASSWORD;SslMode=Required;"
```

### Issue 3: CORS Errors

**Cause**: Frontend origin not in allowed list

**Fix**: Add origin to App Settings:
```powershell
az webapp config appsettings set --resource-group rg-azure-sanrachna-ai --name sanrachna-ai-api-dev --settings "CorsOrigins__2=http://localhost:4200"
```

---

## ✅ Health Check Endpoint

After deployment, verify everything is working:

```powershell
Invoke-RestMethod -Uri "https://sanrachna-ai-api-dev-dshsc6dce7avf9c7.southindia-01.azurewebsites.net/health" | ConvertTo-Json
```

**Expected Response**:
```json
{
  "status": "healthy",
  "environment": "Production",
  "configuration": {
    "databaseConfigured": true,
    "jwtConfigured": true,
    "databaseServer": "dev-sanrachna.mysql.database.azure.com"
  }
}
```

---

## 📋 Deployment Checklist

Before deploying, verify:

- [ ] `dotnet publish -c Release` completes successfully
- [ ] `publish.zip` created from `./publish/*` folder
- [ ] Logged into Azure CLI (`az login --use-device-code`)
- [ ] Correct resource group: `rg-azure-sanrachna-ai`
- [ ] Correct app service name: `sanrachna-ai-api-dev`

After deploying, verify:

- [ ] Health endpoint returns `status: healthy`
- [ ] `databaseConfigured: true`
- [ ] `jwtConfigured: true`
- [ ] API endpoints work with valid JWT token
- [ ] CORS works from frontend application

---

## 🔒 Security Notes

1. **Never commit secrets** to git - use Azure App Settings
2. `publish/` and `publish.zip` are in `.gitignore` - don't commit build artifacts
3. Rotate secrets periodically
4. Enable HTTPS Only in Azure Portal

---

## 📝 Useful Azure CLI Commands

```powershell
# List all app services
az webapp list --output table

# View app settings
az webapp config appsettings list --resource-group rg-azure-sanrachna-ai --name sanrachna-ai-api-dev --output table

# View live logs
az webapp log tail --resource-group rg-azure-sanrachna-ai --name sanrachna-ai-api-dev

# Restart app service
az webapp restart --resource-group rg-azure-sanrachna-ai --name sanrachna-ai-api-dev

# Delete unused setting
az webapp config appsettings delete --resource-group rg-azure-sanrachna-ai --name sanrachna-ai-api-dev --setting-names DefaultConnection
```
