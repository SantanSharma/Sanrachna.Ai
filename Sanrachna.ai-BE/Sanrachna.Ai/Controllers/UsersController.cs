using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sanrachna.Ai.Models.Common;
using Sanrachna.Ai.Models.DTOs.User;
using Sanrachna.Ai.Services.Interfaces;

namespace Sanrachna.Ai.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Get current authenticated user's profile
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized(ApiResponse.FailureResponse("User not authenticated"));

        var user = await _userService.GetByIdAsync(userId.Value);
        if (user == null)
            return NotFound(ApiResponse.FailureResponse("User not found"));

        return Ok(ApiResponse<UserDto>.SuccessResponse(user));
    }

    /// <summary>
    /// Get user by ID (Admin only)
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null)
            return NotFound(ApiResponse.FailureResponse("User not found"));

        return Ok(ApiResponse<UserDto>.SuccessResponse(user));
    }

    /// <summary>
    /// Get all users (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResult<UserDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _userService.GetAllAsync(pageNumber, pageSize);
        return Ok(ApiResponse<PaginatedResult<UserDto>>.SuccessResponse(result));
    }

    /// <summary>
    /// Update user profile
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UserUpdateDto dto)
    {
        var currentUserId = GetCurrentUserId();
        var isAdmin = User.IsInRole("admin");

        // Users can only update their own profile unless they're admin
        if (currentUserId != id && !isAdmin)
            return Forbid();

        var result = await _userService.UpdateAsync(id, dto);
        if (result == null)
            return NotFound(ApiResponse.FailureResponse("User not found"));

        return Ok(ApiResponse<UserDto>.SuccessResponse(result, "User updated successfully"));
    }

    /// <summary>
    /// Delete user (Admin only - soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _userService.DeleteAsync(id);
        if (!result)
            return NotFound(ApiResponse.FailureResponse("User not found"));

        return Ok(ApiResponse.SuccessResponse("User deleted successfully"));
    }

    /// <summary>
    /// Change user password
    /// </summary>
    [HttpPut("{id}/password")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ChangePassword(int id, [FromBody] PasswordChangeDto dto)
    {
        var currentUserId = GetCurrentUserId();
        
        // Users can only change their own password
        if (currentUserId != id)
            return Forbid();

        var result = await _userService.ChangePasswordAsync(id, dto);
        if (!result)
            return BadRequest(ApiResponse.FailureResponse("Password change failed. Check your current password."));

        return Ok(ApiResponse.SuccessResponse("Password changed successfully"));
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            return null;
        return userId;
    }
}
