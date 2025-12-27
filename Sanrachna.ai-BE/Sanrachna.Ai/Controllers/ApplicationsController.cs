using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sanrachna.Ai.Models.Common;
using Sanrachna.Ai.Models.DTOs.Application;
using Sanrachna.Ai.Services.Interfaces;

namespace Sanrachna.Ai.Controllers;

[ApiController]
[Route("api/apps")]
[Authorize]
public class ApplicationsController : ControllerBase
{
    private readonly IApplicationService _applicationService;

    public ApplicationsController(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    /// <summary>
    /// Get all applications
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<ApplicationDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var apps = await _applicationService.GetAllAsync();
        return Ok(ApiResponse<List<ApplicationDto>>.SuccessResponse(apps));
    }

    /// <summary>
    /// Get application by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<ApplicationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var app = await _applicationService.GetByIdAsync(id);
        if (app == null)
            return NotFound(ApiResponse.FailureResponse("Application not found"));

        return Ok(ApiResponse<ApplicationDto>.SuccessResponse(app));
    }

    /// <summary>
    /// Get applications accessible by a specific user
    /// </summary>
    [HttpGet("user/{userId}")]
    [ProducesResponseType(typeof(ApiResponse<List<ApplicationDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUserApplications(int userId)
    {
        var currentUserId = GetCurrentUserId();
        var isAdmin = User.IsInRole("admin");

        // Users can only see their own apps unless they're admin
        if (currentUserId != userId && !isAdmin)
            return Forbid();

        var apps = await _applicationService.GetUserApplicationsAsync(userId);
        return Ok(ApiResponse<List<ApplicationDto>>.SuccessResponse(apps));
    }

    /// <summary>
    /// Get current user's accessible applications
    /// </summary>
    [HttpGet("my")]
    [ProducesResponseType(typeof(ApiResponse<List<ApplicationDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyApplications()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized(ApiResponse.FailureResponse("User not authenticated"));

        var apps = await _applicationService.GetUserApplicationsAsync(userId.Value);
        return Ok(ApiResponse<List<ApplicationDto>>.SuccessResponse(apps));
    }

    /// <summary>
    /// Create a new application (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(typeof(ApiResponse<ApplicationDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] ApplicationCreateDto dto)
    {
        var app = await _applicationService.CreateAsync(dto);
        if (app == null)
            return BadRequest(ApiResponse.FailureResponse("Application name already exists or creation failed"));

        return CreatedAtAction(nameof(GetById), new { id = app.Id }, 
            ApiResponse<ApplicationDto>.SuccessResponse(app, "Application created successfully"));
    }

    /// <summary>
    /// Update an application (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(typeof(ApiResponse<ApplicationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] ApplicationUpdateDto dto)
    {
        var app = await _applicationService.UpdateAsync(id, dto);
        if (app == null)
            return NotFound(ApiResponse.FailureResponse("Application not found or name already exists"));

        return Ok(ApiResponse<ApplicationDto>.SuccessResponse(app, "Application updated successfully"));
    }

    /// <summary>
    /// Delete an application (Admin only - soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _applicationService.DeleteAsync(id);
        if (!result)
            return NotFound(ApiResponse.FailureResponse("Application not found"));

        return Ok(ApiResponse.SuccessResponse("Application deleted successfully"));
    }

    /// <summary>
    /// Assign application access to a user (Admin only)
    /// </summary>
    [HttpPost("assign")]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignAccess([FromBody] ApplicationAccessDto dto)
    {
        var grantedByUserId = GetCurrentUserId();
        if (grantedByUserId == null)
            return Unauthorized(ApiResponse.FailureResponse("User not authenticated"));

        var result = await _applicationService.AssignAccessAsync(dto.UserId, dto.ApplicationId, grantedByUserId.Value);
        if (!result)
            return BadRequest(ApiResponse.FailureResponse("Access already exists or user/application not found"));

        return Ok(ApiResponse.SuccessResponse("Access granted successfully"));
    }

    /// <summary>
    /// Revoke application access from a user (Admin only)
    /// </summary>
    [HttpDelete("revoke")]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RevokeAccess([FromBody] ApplicationAccessDto dto)
    {
        var result = await _applicationService.RevokeAccessAsync(dto.UserId, dto.ApplicationId);
        if (!result)
            return NotFound(ApiResponse.FailureResponse("Access not found"));

        return Ok(ApiResponse.SuccessResponse("Access revoked successfully"));
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            return null;
        return userId;
    }
}
