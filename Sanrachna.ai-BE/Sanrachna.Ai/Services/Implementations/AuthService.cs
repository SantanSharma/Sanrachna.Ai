using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Sanrachna.Ai.Data;
using Sanrachna.Ai.Helpers;
using Sanrachna.Ai.Models.DTOs.Auth;
using Sanrachna.Ai.Models.Entities;
using Sanrachna.Ai.Services.Interfaces;
using BCrypt.Net;
using Google.Apis.Auth;

namespace Sanrachna.Ai.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IAuditService _auditService;
    private readonly GoogleSettings _googleSettings;

    public AuthService(
        AppDbContext context, 
        ITokenService tokenService, 
        IAuditService auditService,
        IOptions<GoogleSettings> googleSettings)
    {
        _context = context;
        _tokenService = tokenService;
        _auditService = auditService;
        _googleSettings = googleSettings.Value;
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginRequestDto request, string ipAddress)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower() && u.IsActive);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        
        // Generate tokens
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken(ipAddress);
        refreshToken.UserId = user.Id;

        // Save refresh token
        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        // Log the login
        await _auditService.LogLoginAsync(user.Id, ipAddress, null);

        return new AuthResponseDto
        {
            Token = accessToken,
            RefreshToken = refreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = new UserInfoDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                AvatarUrl = user.AvatarUrl,
                Role = user.Role.Name
            }
        };
    }

    public async Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto request, string ipAddress)
    {
        // Check if email already exists
        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower()))
            return null;

        // Get default user role
        var userRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "user");
        if (userRole == null)
            return null;

        // Create user
        var user = new User
        {
            Name = request.Name,
            Email = request.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = userRole.Id,
            IsActive = true,
            EmailConfirmed = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Load the role for token generation
        user.Role = userRole;

        // Generate tokens
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken(ipAddress);
        refreshToken.UserId = user.Id;

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = accessToken,
            RefreshToken = refreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = new UserInfoDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                AvatarUrl = user.AvatarUrl,
                Role = user.Role.Name
            }
        };
    }

    public async Task<AuthResponseDto?> RefreshTokenAsync(string refreshToken, string ipAddress)
    {
        var storedToken = await _context.RefreshTokens
            .Include(rt => rt.User)
            .ThenInclude(u => u.Role)
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (storedToken == null || !storedToken.IsActive)
            return null;

        // Revoke old token
        storedToken.RevokedAt = DateTime.UtcNow;
        storedToken.RevokedByIp = ipAddress;

        // Generate new tokens
        var user = storedToken.User;
        var newAccessToken = _tokenService.GenerateAccessToken(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken(ipAddress);
        newRefreshToken.UserId = user.Id;

        storedToken.ReplacedByToken = newRefreshToken.Token;

        _context.RefreshTokens.Add(newRefreshToken);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = newAccessToken,
            RefreshToken = newRefreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = new UserInfoDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                AvatarUrl = user.AvatarUrl,
                Role = user.Role.Name
            }
        };
    }

    public async Task<bool> LogoutAsync(int userId, string refreshToken, string ipAddress)
    {
        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken && rt.UserId == userId);

        if (storedToken != null)
        {
            storedToken.RevokedAt = DateTime.UtcNow;
            storedToken.RevokedByIp = ipAddress;
            await _context.SaveChangesAsync();
        }

        await _auditService.LogLogoutAsync(userId, ipAddress, null);
        return true;
    }

    public async Task<bool> ValidateTokenAsync(string token)
    {
        var principal = _tokenService.ValidateToken(token);
        if (principal == null) return false;

        var userId = _tokenService.GetUserIdFromToken(token);
        if (userId == null) return false;

        var user = await _context.Users.FindAsync(userId);
        return user != null && user.IsActive;
    }

    public async Task<bool> ForgotPasswordAsync(ForgotPasswordRequestDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (user == null)
            return true; // Don't reveal if email exists

        // In a real implementation, you would:
        // 1. Generate a password reset token
        // 2. Store it in the database with expiration
        // 3. Send an email with the reset link
        
        // For now, we'll just return true
        return true;
    }

    public async Task<AuthResponseDto?> GoogleLoginAsync(GoogleLoginRequestDto request, string ipAddress)
    {
        try
        {
            // Validate the Google ID token
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _googleSettings.ClientId }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
            
            if (payload == null)
                return null;

            // Check if user exists with this Google ID or email
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.GoogleId == payload.Subject || u.Email.ToLower() == payload.Email.ToLower());

            if (user == null)
            {
                // Create new user from Google account
                var userRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "user");
                if (userRole == null)
                    return null;

                user = new User
                {
                    Name = payload.Name ?? payload.Email.Split('@')[0],
                    Email = payload.Email.ToLower(),
                    PasswordHash = "", // No password for Google users
                    GoogleId = payload.Subject,
                    AvatarUrl = payload.Picture,
                    RoleId = userRole.Id,
                    IsActive = true,
                    EmailConfirmed = payload.EmailVerified,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Load the role for token generation
                user.Role = userRole;
            }
            else
            {
                // Update existing user with Google info if not already linked
                if (string.IsNullOrEmpty(user.GoogleId))
                {
                    user.GoogleId = payload.Subject;
                }
                if (string.IsNullOrEmpty(user.AvatarUrl) && !string.IsNullOrEmpty(payload.Picture))
                {
                    user.AvatarUrl = payload.Picture;
                }
                user.LastLoginAt = DateTime.UtcNow;
                user.EmailConfirmed = true; // Google verified the email
            }

            // Generate tokens
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken(ipAddress);
            refreshToken.UserId = user.Id;

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();

            // Log the login
            await _auditService.LogLoginAsync(user.Id, ipAddress, "Google OAuth");

            return new AuthResponseDto
            {
                Token = accessToken,
                RefreshToken = refreshToken.Token,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                User = new UserInfoDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    AvatarUrl = user.AvatarUrl,
                    Role = user.Role.Name
                }
            };
        }
        catch (InvalidJwtException)
        {
            return null; // Invalid Google token
        }
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordRequestDto request)
    {
        // In a real implementation, you would:
        // 1. Validate the reset token
        // 2. Check if it's not expired
        // 3. Update the password
        
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (user == null)
            return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }
}
