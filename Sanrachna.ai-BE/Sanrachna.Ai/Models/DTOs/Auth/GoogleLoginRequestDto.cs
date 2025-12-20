using System.ComponentModel.DataAnnotations;

namespace Sanrachna.Ai.Models.DTOs.Auth;

/// <summary>
/// Request DTO for Google OAuth login
/// </summary>
public class GoogleLoginRequestDto
{
    /// <summary>
    /// The Google ID token received from Google Sign-In
    /// </summary>
    [Required]
    public string IdToken { get; set; } = string.Empty;
}
