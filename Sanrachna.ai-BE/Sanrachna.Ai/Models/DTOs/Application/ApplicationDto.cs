namespace Sanrachna.Ai.Models.DTOs.Application;

public class ApplicationDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string IconColor { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool IsSupported { get; set; }
    public bool RequiresAuth { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime? GrantedAt { get; set; }
}
