using System.Security.Claims;
using Sanrachna.Ai.Models.Entities;

namespace Sanrachna.Ai.Services.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    RefreshToken GenerateRefreshToken(string ipAddress);
    ClaimsPrincipal? ValidateToken(string token);
    int? GetUserIdFromToken(string token);
}
