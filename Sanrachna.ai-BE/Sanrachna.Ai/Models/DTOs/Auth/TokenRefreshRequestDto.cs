using System.ComponentModel.DataAnnotations;

namespace Sanrachna.Ai.Models.DTOs.Auth;

public class TokenRefreshRequestDto
{
    [Required(ErrorMessage = "Refresh token is required")]
    public string RefreshToken { get; set; } = string.Empty;
}
