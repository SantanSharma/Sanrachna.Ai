using Microsoft.EntityFrameworkCore;
using Sanrachna.Ai.Models.Entities;

namespace Sanrachna.Ai.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<UserApplication> UserApplications => Set<UserApplication>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<UserSession> UserSessions => Set<UserSession>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations from the assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Seed default roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "admin", Description = "System Administrator with full access", IsSystemRole = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Role { Id = 2, Name = "user", Description = "Standard user with limited access", IsSystemRole = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Role { Id = 3, Name = "guest", Description = "Guest user with read-only access", IsSystemRole = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        // Seed default applications
        modelBuilder.Entity<Application>().HasData(
            new Application { Id = 1, Name = "Email", Description = "Corporate email system", Url = "http://localhost:4201", Icon = "mail", IconColor = "bg-blue-500", Category = "Communication", IsSupported = true, DisplayOrder = 1, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Application { Id = 2, Name = "Team Hub", Description = "Team collaboration", Url = "http://localhost:4202", Icon = "groups", IconColor = "bg-orange-500", Category = "Communication", IsSupported = true, DisplayOrder = 2, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Application { Id = 3, Name = "Chat", Description = "Instant messaging", Url = "http://localhost:4203", Icon = "chat", IconColor = "bg-teal-500", Category = "Communication", IsSupported = true, DisplayOrder = 3, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Application { Id = 4, Name = "Documents", Description = "Document management", Url = "http://localhost:4204", Icon = "description", IconColor = "bg-green-500", Category = "Productivity", IsSupported = true, DisplayOrder = 4, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Application { Id = 5, Name = "Calendar", Description = "Schedule & meetings", Url = "http://localhost:4205", Icon = "calendar_today", IconColor = "bg-red-500", Category = "Productivity", IsSupported = true, DisplayOrder = 5, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Application { Id = 6, Name = "File Storage", Description = "Cloud storage", Url = "http://localhost:4206", Icon = "folder_open", IconColor = "bg-yellow-500", Category = "Productivity", IsSupported = true, DisplayOrder = 6, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Application { Id = 7, Name = "Analytics", Description = "Business intelligence", Url = "http://localhost:4207", Icon = "analytics", IconColor = "bg-purple-500", Category = "Analytics", IsSupported = false, DisplayOrder = 7, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Application { Id = 8, Name = "Admin Panel", Description = "System administration", Url = "http://localhost:4208", Icon = "admin_panel_settings", IconColor = "bg-gray-500", Category = "Administration", IsSupported = false, DisplayOrder = 8, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}
