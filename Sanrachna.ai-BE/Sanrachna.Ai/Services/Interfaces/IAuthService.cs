using Sanrachna.Ai.Models.DTOs.Auth;

namespace Sanrachna.Ai.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginRequestDto request, string ipAddress);
    Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto request, string ipAddress);
    Task<AuthResponseDto?> RefreshTokenAsync(string refreshToken, string ipAddress);
    Task<AuthResponseDto?> GoogleLoginAsync(GoogleLoginRequestDto request, string ipAddress);
    Task<bool> LogoutAsync(int userId, string refreshToken, string ipAddress);
    Task<bool> ValidateTokenAsync(string token);
    Task<bool> ForgotPasswordAsync(ForgotPasswordRequestDto request);
    Task<bool> ResetPasswordAsync(ResetPasswordRequestDto request);
}
