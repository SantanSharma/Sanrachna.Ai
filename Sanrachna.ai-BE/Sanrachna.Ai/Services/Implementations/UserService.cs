using Microsoft.EntityFrameworkCore;
using Sanrachna.Ai.Data;
using Sanrachna.Ai.Models.Common;
using Sanrachna.Ai.Models.DTOs.User;
using Sanrachna.Ai.Models.Entities;
using Sanrachna.Ai.Services.Interfaces;
using BCrypt.Net;

namespace Sanrachna.Ai.Services.Implementations;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return null;

        return MapToDto(user);
    }

    public async Task<UserDto?> GetByEmailAsync(string email)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

        if (user == null) return null;

        return MapToDto(user);
    }

    public async Task<PaginatedResult<UserDto>> GetAllAsync(int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.Users
            .Include(u => u.Role)
            .OrderBy(u => u.Name);

        var totalCount = await query.CountAsync();
        var users = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var userDtos = users.Select(MapToDto).ToList();

        return new PaginatedResult<UserDto>(userDtos, totalCount, pageNumber, pageSize);
    }

    public async Task<UserDto?> UpdateAsync(int id, UserUpdateDto dto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return null;

        user.Name = dto.Name;
        user.AvatarUrl = dto.AvatarUrl;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(user);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        // Soft delete - just mark as inactive
        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ChangePasswordAsync(int id, PasswordChangeDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        // Verify current password
        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateRoleAsync(int userId, int roleId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        var role = await _context.Roles.FindAsync(roleId);
        if (role == null) return false;

        user.RoleId = roleId;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<UserDto?> AdminUpdateAsync(int id, AdminUserUpdateDto dto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return null;

        user.Name = dto.Name;
        user.AvatarUrl = dto.AvatarUrl;
        user.UpdatedAt = DateTime.UtcNow;

        // Update role if provided
        if (dto.RoleId.HasValue)
        {
            var role = await _context.Roles.FindAsync(dto.RoleId.Value);
            if (role != null)
            {
                user.RoleId = dto.RoleId.Value;
                user.Role = role;
            }
        }

        // Update active status if provided
        if (dto.IsActive.HasValue)
        {
            user.IsActive = dto.IsActive.Value;
        }

        await _context.SaveChangesAsync();

        return MapToDto(user);
    }

    public async Task<bool> ToggleActiveAsync(int userId, bool isActive)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    private static UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            AvatarUrl = user.AvatarUrl,
            IsActive = user.IsActive,
            EmailConfirmed = user.EmailConfirmed,
            RoleName = user.Role?.Name ?? "user",
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }
}
