namespace Sanrachna.Ai.Services.Interfaces;

public interface IAuditService
{
    Task LogAsync(int? userId, string action, string entityType, int? entityId, string? oldValues, string? newValues, string? ipAddress, string? userAgent);
    Task LogLoginAsync(int userId, string ipAddress, string? userAgent);
    Task LogLogoutAsync(int userId, string ipAddress, string? userAgent);
    Task LogPasswordChangeAsync(int userId, string ipAddress, string? userAgent);
    Task LogUserCreatedAsync(int userId, int createdUserId, string ipAddress, string? userAgent);
    Task LogUserDeletedAsync(int userId, int deletedUserId, string ipAddress, string? userAgent);
}
