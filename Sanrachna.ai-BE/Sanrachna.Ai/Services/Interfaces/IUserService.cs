using Sanrachna.Ai.Models.DTOs.User;
using Sanrachna.Ai.Models.Common;

namespace Sanrachna.Ai.Services.Interfaces;

public interface IUserService
{
    Task<UserDto?> GetByIdAsync(int id);
    Task<UserDto?> GetByEmailAsync(string email);
    Task<PaginatedResult<UserDto>> GetAllAsync(int pageNumber = 1, int pageSize = 10);
    Task<UserDto?> UpdateAsync(int id, UserUpdateDto dto);
    Task<UserDto?> AdminUpdateAsync(int id, AdminUserUpdateDto dto);
    Task<bool> DeleteAsync(int id);
    Task<bool> ChangePasswordAsync(int id, PasswordChangeDto dto);
    Task<bool> UpdateRoleAsync(int userId, int roleId);
    Task<bool> ToggleActiveAsync(int userId, bool isActive);
}
