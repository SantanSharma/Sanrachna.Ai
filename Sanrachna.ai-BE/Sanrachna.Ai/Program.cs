using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Sanrachna.Ai.Data;
using Sanrachna.Ai.Helpers;
using Sanrachna.Ai.Middleware;
using Sanrachna.Ai.Services.Implementations;
using Sanrachna.Ai.Services.Interfaces;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container

// Database Context - MySQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Validate connection string
if (string.IsNullOrEmpty(connectionString) || connectionString.Contains("WILL_BE_SET"))
{
    Log.Error("Database connection string is not configured! Please set ConnectionStrings__DefaultConnection in Azure App Settings.");
    // Continue without DB for health check to work
}

var serverVersion = new MySqlServerVersion(new Version(8, 0, 36)); // Adjust version as needed

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (!string.IsNullOrEmpty(connectionString) && !connectionString.Contains("WILL_BE_SET"))
    {
        options.UseMySql(connectionString, serverVersion, mySqlOptions =>
        {
            mySqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        });
    }
});

// JWT Settings - with validation
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();

// Validate JWT settings
if (jwtSettings == null || string.IsNullOrEmpty(jwtSettings.SecretKey) || jwtSettings.SecretKey.Contains("WILL_BE_SET"))
{
    Log.Error("JWT settings are not configured! Please set JwtSettings__SecretKey in Azure App Settings.");
    // Use a default key for startup (API will fail auth but at least start)
    jwtSettings = new JwtSettings 
    { 
        SecretKey = "TemporaryKeyForStartupOnlyPleaseConfigureProperKey123!",
        Issuer = "Sanrachna.Ai",
        Audience = "Sanrachna.Ai.Users",
        AccessTokenExpirationMinutes = 60,
        RefreshTokenExpirationDays = 7
    };
};

// Google OAuth Settings
builder.Services.Configure<GoogleSettings>(builder.Configuration.GetSection("GoogleSettings"));

// Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings.Audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// CORS
var corsOrigins = builder.Configuration.GetSection("CorsOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowedOrigins", policy =>
    {
        policy.WithOrigins(corsOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Register Services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IApplicationService, ApplicationService>();

// Controllers
builder.Services.AddControllers();

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Sanrachna.Ai API",
        Version = "v1",
        Description = "Centralized SSO-based Authentication API for Sanrachna.Ai",
        Contact = new OpenApiContact
        {
            Name = "Sanrachna.AI Team",
            Email = "support@sanrachna.com"
        }
    });

    // Add JWT Authentication to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline

// Custom Middleware
app.UseExceptionMiddleware();
app.UseRequestLogging();

// Swagger (available in all environments for now)
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Sanrachna.Ai API v1");
    options.RoutePrefix = string.Empty; // Serve Swagger UI at root
});

// CORS
app.UseCors("AllowedOrigins");

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map Controllers
app.MapControllers();

// Health check endpoint - useful for Azure health probes and testing
app.MapGet("/health", (IConfiguration config) => 
{
    var connString = config.GetConnectionString("DefaultConnection");
    var jwtKey = config["JwtSettings:SecretKey"];
    
    return Results.Ok(new 
    { 
        status = "healthy", 
        timestamp = DateTime.UtcNow,
        environment = app.Environment.EnvironmentName,
        configuration = new 
        {
            databaseConfigured = !string.IsNullOrEmpty(connString) && !connString.Contains("WILL_BE_SET"),
            jwtConfigured = !string.IsNullOrEmpty(jwtKey) && !jwtKey.Contains("WILL_BE_SET"),
            databaseServer = !string.IsNullOrEmpty(connString) && !connString.Contains("WILL_BE_SET") 
                ? connString.Split(';').FirstOrDefault(s => s.StartsWith("Server="))?.Replace("Server=", "") ?? "Not set"
                : "Not configured"
        }
    });
});

// API info endpoint
app.MapGet("/api", () => Results.Ok(new 
{ 
    name = "Sanrachna.Ai API",
    version = "v1",
    documentation = "/swagger",
    endpoints = new[] { "/health", "/swagger", "/api/auth/login", "/api/auth/register" }
}));

// Diagnostic endpoint to check configuration
app.MapGet("/diag", (IConfiguration config) => 
{
    var connString = config.GetConnectionString("DefaultConnection") ?? "NOT SET";
    var jwtKey = config["JwtSettings:SecretKey"] ?? "NOT SET";
    var jwtIssuer = config["JwtSettings:Issuer"] ?? "NOT SET";
    var googleClientId = config["GoogleSettings:ClientId"] ?? "NOT SET";
    
    return Results.Ok(new
    {
        environment = app.Environment.EnvironmentName,
        configurationStatus = new
        {
            connectionString = connString.Contains("WILL_BE_SET") ? "❌ PLACEHOLDER - NOT CONFIGURED" 
                             : connString == "NOT SET" ? "❌ NOT SET" 
                             : "✅ Configured (Server: " + (connString.Split(';').FirstOrDefault(s => s.StartsWith("Server="))?.Replace("Server=", "") ?? "unknown") + ")",
            jwtSecretKey = jwtKey.Contains("WILL_BE_SET") ? "❌ PLACEHOLDER - NOT CONFIGURED"
                         : jwtKey == "NOT SET" ? "❌ NOT SET"
                         : "✅ Configured (" + jwtKey.Length + " chars)",
            jwtIssuer = jwtIssuer,
            googleClientId = googleClientId.Contains("WILL_BE_SET") ? "❌ PLACEHOLDER - NOT CONFIGURED"
                           : googleClientId == "NOT SET" ? "❌ NOT SET"
                           : "✅ Configured"
        },
        requiredAzureAppSettings = new[]
        {
            "ConnectionStrings__DefaultConnection",
            "JwtSettings__SecretKey", 
            "GoogleSettings__ClientId",
            "GoogleSettings__ClientSecret"
        }
    });
});

// Seed database (optional - for development)
if (!string.IsNullOrEmpty(connectionString) && !connectionString.Contains("WILL_BE_SET"))
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        try
        {
            // Ensure database is created (for development)
            await context.Database.MigrateAsync();
            Log.Information("Database migration completed successfully");
        }
        catch (Exception ex)
        {
            Log.Warning(ex, "Database migration failed. The database may need to be created manually.");
        }
    }
}
else
{
    Log.Warning("Skipping database migration - connection string not configured");
}

Log.Information("Sanrachna.Ai API started successfully on {Environment}", app.Environment.EnvironmentName);

app.Run();
