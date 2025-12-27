using System.ComponentModel.DataAnnotations;

namespace Sanrachna.Ai.Models.DTOs.Application;

public class ApplicationAccessDto
{
    [Required(ErrorMessage = "User ID is required")]
    public int UserId { get; set; }

    [Required(ErrorMessage = "Application ID is required")]
    public int ApplicationId { get; set; }
}
