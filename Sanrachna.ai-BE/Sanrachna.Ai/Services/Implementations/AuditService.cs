using Microsoft.EntityFrameworkCore;
using Sanrachna.Ai.Data;
using Sanrachna.Ai.Models.Entities;
using Sanrachna.Ai.Services.Interfaces;

namespace Sanrachna.Ai.Services.Implementations;

public class AuditService : IAuditService
{
    private readonly AppDbContext _context;

    public AuditService(AppDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(int? userId, string action, string entityType, int? entityId, 
        string? oldValues, string? newValues, string? ipAddress, string? userAgent)
    {
        var auditLog = new AuditLog
        {
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            OldValues = oldValues,
            NewValues = newValues,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            Timestamp = DateTime.UtcNow
        };

        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();
    }

    public async Task LogLoginAsync(int userId, string ipAddress, string? userAgent)
    {
        await LogAsync(userId, "Login", "User", userId, null, null, ipAddress, userAgent);
    }

    public async Task LogLogoutAsync(int userId, string ipAddress, string? userAgent)
    {
        await LogAsync(userId, "Logout", "User", userId, null, null, ipAddress, userAgent);
    }

    public async Task LogPasswordChangeAsync(int userId, string ipAddress, string? userAgent)
    {
        await LogAsync(userId, "PasswordChange", "User", userId, null, null, ipAddress, userAgent);
    }

    public async Task LogUserCreatedAsync(int userId, int createdUserId, string ipAddress, string? userAgent)
    {
        await LogAsync(userId, "UserCreated", "User", createdUserId, null, null, ipAddress, userAgent);
    }

    public async Task LogUserDeletedAsync(int userId, int deletedUserId, string ipAddress, string? userAgent)
    {
        await LogAsync(userId, "UserDeleted", "User", deletedUserId, null, null, ipAddress, userAgent);
    }
}
