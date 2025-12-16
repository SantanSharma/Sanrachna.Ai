using System.ComponentModel.DataAnnotations;

namespace Sanrachna.Ai.Models.DTOs.Application;

public class ApplicationCreateDto
{
    [Required(ErrorMessage = "Name is required")]
    [MaxLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required")]
    [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "URL is required")]
    [MaxLength(500, ErrorMessage = "URL cannot exceed 500 characters")]
    [Url(ErrorMessage = "Invalid URL format")]
    public string Url { get; set; } = string.Empty;

    [MaxLength(50, ErrorMessage = "Icon cannot exceed 50 characters")]
    public string Icon { get; set; } = "apps";

    [MaxLength(50, ErrorMessage = "Icon color cannot exceed 50 characters")]
    public string IconColor { get; set; } = "bg-blue-500";

    [MaxLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
    public string Category { get; set; } = "Other";

    public bool IsSupported { get; set; } = true;
    public bool RequiresAuth { get; set; } = true;
    public int DisplayOrder { get; set; } = 0;
}
