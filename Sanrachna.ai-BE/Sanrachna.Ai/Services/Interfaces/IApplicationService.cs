using Sanrachna.Ai.Models.DTOs.Application;
using Sanrachna.Ai.Models.Common;

namespace Sanrachna.Ai.Services.Interfaces;

public interface IApplicationService
{
    Task<ApplicationDto?> GetByIdAsync(int id);
    Task<List<ApplicationDto>> GetAllAsync();
    Task<List<ApplicationDto>> GetUserApplicationsAsync(int userId);
    Task<ApplicationDto?> CreateAsync(ApplicationCreateDto dto);
    Task<ApplicationDto?> UpdateAsync(int id, ApplicationUpdateDto dto);
    Task<bool> DeleteAsync(int id);
    Task<bool> AssignAccessAsync(int userId, int applicationId, int grantedByUserId);
    Task<bool> RevokeAccessAsync(int userId, int applicationId);
    Task<bool> HasAccessAsync(int userId, int applicationId);
}
