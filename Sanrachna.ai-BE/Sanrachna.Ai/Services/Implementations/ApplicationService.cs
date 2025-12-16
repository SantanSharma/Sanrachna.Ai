using Microsoft.EntityFrameworkCore;
using Sanrachna.Ai.Data;
using Sanrachna.Ai.Models.DTOs.Application;
using Sanrachna.Ai.Models.Entities;
using Sanrachna.Ai.Services.Interfaces;

namespace Sanrachna.Ai.Services.Implementations;

public class ApplicationService : IApplicationService
{
    private readonly AppDbContext _context;

    public ApplicationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApplicationDto?> GetByIdAsync(int id)
    {
        var app = await _context.Applications.FindAsync(id);
        if (app == null) return null;

        return MapToDto(app);
    }

    public async Task<List<ApplicationDto>> GetAllAsync()
    {
        var apps = await _context.Applications
            .Where(a => a.IsActive)
            .OrderBy(a => a.Category)
            .ThenBy(a => a.DisplayOrder)
            .ThenBy(a => a.Name)
            .ToListAsync();

        return apps.Select(a => MapToDto(a)).ToList();
    }

    public async Task<List<ApplicationDto>> GetUserApplicationsAsync(int userId)
    {
        var userApps = await _context.UserApplications
            .Include(ua => ua.Application)
            .Where(ua => ua.UserId == userId && ua.Application.IsActive)
            .OrderBy(ua => ua.Application.Category)
            .ThenBy(ua => ua.Application.DisplayOrder)
            .ThenBy(ua => ua.Application.Name)
            .ToListAsync();

        return userApps.Select(ua => MapToDto(ua.Application, ua.GrantedAt)).ToList();
    }

    public async Task<ApplicationDto?> CreateAsync(ApplicationCreateDto dto)
    {
        // Check if name already exists
        if (await _context.Applications.AnyAsync(a => a.Name.ToLower() == dto.Name.ToLower()))
            return null;

        var app = new Application
        {
            Name = dto.Name,
            Description = dto.Description,
            Url = dto.Url,
            Icon = dto.Icon,
            IconColor = dto.IconColor,
            Category = dto.Category,
            IsSupported = dto.IsSupported,
            RequiresAuth = dto.RequiresAuth,
            DisplayOrder = dto.DisplayOrder,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Applications.Add(app);
        await _context.SaveChangesAsync();

        return MapToDto(app);
    }

    public async Task<ApplicationDto?> UpdateAsync(int id, ApplicationUpdateDto dto)
    {
        var app = await _context.Applications.FindAsync(id);
        if (app == null) return null;

        // Check if name is being changed to an existing name
        if (await _context.Applications.AnyAsync(a => a.Name.ToLower() == dto.Name.ToLower() && a.Id != id))
            return null;

        app.Name = dto.Name;
        app.Description = dto.Description;
        app.Url = dto.Url;
        app.Icon = dto.Icon;
        app.IconColor = dto.IconColor;
        app.Category = dto.Category;
        app.IsSupported = dto.IsSupported;
        app.RequiresAuth = dto.RequiresAuth;
        app.DisplayOrder = dto.DisplayOrder;
        app.IsActive = dto.IsActive;
        app.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(app);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var app = await _context.Applications.FindAsync(id);
        if (app == null) return false;

        // Soft delete
        app.IsActive = false;
        app.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AssignAccessAsync(int userId, int applicationId, int grantedByUserId)
    {
        // Check if access already exists
        if (await _context.UserApplications.AnyAsync(ua => ua.UserId == userId && ua.ApplicationId == applicationId))
            return false;

        // Verify user and application exist
        var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
        var appExists = await _context.Applications.AnyAsync(a => a.Id == applicationId);

        if (!userExists || !appExists) return false;

        var userApp = new UserApplication
        {
            UserId = userId,
            ApplicationId = applicationId,
            GrantedByUserId = grantedByUserId,
            GrantedAt = DateTime.UtcNow
        };

        _context.UserApplications.Add(userApp);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> RevokeAccessAsync(int userId, int applicationId)
    {
        var userApp = await _context.UserApplications
            .FirstOrDefaultAsync(ua => ua.UserId == userId && ua.ApplicationId == applicationId);

        if (userApp == null) return false;

        _context.UserApplications.Remove(userApp);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> HasAccessAsync(int userId, int applicationId)
    {
        return await _context.UserApplications
            .AnyAsync(ua => ua.UserId == userId && ua.ApplicationId == applicationId);
    }

    private static ApplicationDto MapToDto(Application app, DateTime? grantedAt = null)
    {
        return new ApplicationDto
        {
            Id = app.Id,
            Name = app.Name,
            Description = app.Description,
            Url = app.Url,
            Icon = app.Icon,
            IconColor = app.IconColor,
            Category = app.Category,
            IsSupported = app.IsSupported,
            RequiresAuth = app.RequiresAuth,
            DisplayOrder = app.DisplayOrder,
            IsActive = app.IsActive,
            GrantedAt = grantedAt
        };
    }
}
