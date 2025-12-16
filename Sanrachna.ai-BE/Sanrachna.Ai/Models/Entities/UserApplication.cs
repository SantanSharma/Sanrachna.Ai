namespace Sanrachna.Ai.Models.Entities;

public class UserApplication
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ApplicationId { get; set; }
    public DateTime GrantedAt { get; set; } = DateTime.UtcNow;
    public int? GrantedByUserId { get; set; }
    
    // Navigation Properties
    public User User { get; set; } = null!;
    public Application Application { get; set; } = null!;
    public User? GrantedByUser { get; set; }
}
