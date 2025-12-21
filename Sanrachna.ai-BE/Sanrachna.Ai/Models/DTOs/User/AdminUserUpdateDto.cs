using System.ComponentModel.DataAnnotations;

namespace Sanrachna.Ai.Models.DTOs.User;

/// <summary>
/// DTO for admin to update user details including role and status
/// </summary>
public class AdminUserUpdateDto
{
    [Required(ErrorMessage = "Name is required")]
    [MaxLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Avatar URL cannot exceed 500 characters")]
    public string? AvatarUrl { get; set; }

    /// <summary>
    /// Role ID to assign to the user
    /// </summary>
    public int? RoleId { get; set; }

    /// <summary>
    /// Whether the user account is active
    /// </summary>
    public bool? IsActive { get; set; }
}

/// <summary>
/// DTO for updating just the user role
/// </summary>
public class RoleUpdateDto
{
    [Required(ErrorMessage = "Role ID is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Role ID must be a positive number")]
    public int RoleId { get; set; }
}
