namespace Sanrachna.Ai.Models.Entities;

public class Application
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Icon { get; set; } = "apps";
    public string IconColor { get; set; } = "bg-blue-500";
    public string Category { get; set; } = "Other";
    public bool IsSupported { get; set; } = true;
    public bool RequiresAuth { get; set; } = true;
    public int DisplayOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation Properties
    public ICollection<UserApplication> UserApplications { get; set; } = new List<UserApplication>();
}
