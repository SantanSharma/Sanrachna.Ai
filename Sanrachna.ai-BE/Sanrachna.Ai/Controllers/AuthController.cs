using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sanrachna.Ai.Models.Common;
using Sanrachna.Ai.Models.DTOs.Auth;
using Sanrachna.Ai.Services.Interfaces;

namespace Sanrachna.Ai.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// User login with email and password
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var ipAddress = GetIpAddress();
        var result = await _authService.LoginAsync(request, ipAddress);

        if (result == null)
            return Unauthorized(ApiResponse.FailureResponse("Invalid email or password"));

        return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(result, "Login successful"));
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        var ipAddress = GetIpAddress();
        var result = await _authService.RegisterAsync(request, ipAddress);

        if (result == null)
            return BadRequest(ApiResponse.FailureResponse("Email already exists or registration failed"));

        return CreatedAtAction(nameof(Login), ApiResponse<AuthResponseDto>.SuccessResponse(result, "Registration successful"));
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    [HttpPost("refresh-token")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody] TokenRefreshRequestDto request)
    {
        var ipAddress = GetIpAddress();
        var result = await _authService.RefreshTokenAsync(request.RefreshToken, ipAddress);

        if (result == null)
            return Unauthorized(ApiResponse.FailureResponse("Invalid or expired refresh token"));

        return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(result, "Token refreshed successfully"));
    }

    /// <summary>
    /// Logout and invalidate refresh token
    /// </summary>
    [Authorize]
    [HttpPost("logout")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout([FromBody] TokenRefreshRequestDto request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized(ApiResponse.FailureResponse("User not authenticated"));

        var ipAddress = GetIpAddress();
        await _authService.LogoutAsync(userId.Value, request.RefreshToken, ipAddress);

        return Ok(ApiResponse.SuccessResponse("Logout successful"));
    }

    /// <summary>
    /// Validate current JWT token
    /// </summary>
    [Authorize]
    [HttpGet("validate-token")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public IActionResult ValidateToken()
    {
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Token is valid"));
    }

    /// <summary>
    /// Request password reset
    /// </summary>
    [HttpPost("forgot-password")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
    {
        await _authService.ForgotPasswordAsync(request);
        // Always return success to prevent email enumeration
        return Ok(ApiResponse.SuccessResponse("If the email exists, a password reset link has been sent"));
    }

    /// <summary>
    /// Reset password using token
    /// </summary>
    [HttpPost("reset-password")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        var result = await _authService.ResetPasswordAsync(request);

        if (!result)
            return BadRequest(ApiResponse.FailureResponse("Password reset failed"));

        return Ok(ApiResponse.SuccessResponse("Password reset successful"));
    }

    private string GetIpAddress()
    {
        if (Request.Headers.ContainsKey("X-Forwarded-For"))
            return Request.Headers["X-Forwarded-For"].FirstOrDefault() ?? "unknown";
        
        return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "unknown";
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            return null;
        return userId;
    }
}
