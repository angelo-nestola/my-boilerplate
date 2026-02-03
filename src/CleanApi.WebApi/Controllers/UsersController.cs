using CleanApi.Application.Features.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanApi.WebApi.Controllers;

/// <summary>
/// API for managing users.
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Gets all users with optional search filter.
    /// </summary>
    /// <param name="search">Optional search term for email, first name, or last name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of users.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] string? search, CancellationToken cancellationToken)
    {
        var result = await _userService.GetAllAsync(search, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a user by ID.
    /// </summary>
    /// <param name="id">User ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>User details.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string id, CancellationToken cancellationToken)
    {
        var result = await _userService.GetByIdAsync(id, cancellationToken);
        if (!result.Succeeded)
        {
            return NotFound(new { error = string.Join(", ", result.Errors) });
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Creates a new user.
    /// </summary>
    /// <param name="dto">User creation data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Created user.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto, CancellationToken cancellationToken)
    {
        var result = await _userService.CreateAsync(dto, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        }
        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    /// <summary>
    /// Updates an existing user.
    /// </summary>
    /// <param name="id">User ID.</param>
    /// <param name="dto">User update data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated user.</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateUserDto dto, CancellationToken cancellationToken)
    {
        var result = await _userService.UpdateAsync(id, dto, cancellationToken);
        if (!result.Succeeded)
        {
            var error = string.Join(", ", result.Errors);
            if (error.Contains("not found"))
            {
                return NotFound(new { error });
            }
            return BadRequest(new { error });
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Changes a user's password.
    /// </summary>
    /// <param name="id">User ID.</param>
    /// <param name="dto">Password change data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpPost("{id}/change-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangePassword(string id, [FromBody] ChangePasswordDto dto, CancellationToken cancellationToken)
    {
        var result = await _userService.ChangePasswordAsync(id, dto, cancellationToken);
        if (!result.Succeeded)
        {
            var error = string.Join(", ", result.Errors);
            if (error.Contains("not found"))
            {
                return NotFound(new { error });
            }
            return BadRequest(new { error });
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a user.
    /// </summary>
    /// <param name="id">User ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var result = await _userService.DeleteAsync(id, cancellationToken);
        if (!result.Succeeded)
        {
            return NotFound(new { error = string.Join(", ", result.Errors) });
        }
        return NoContent();
    }

    /// <summary>
    /// Gets available roles.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of role names.</returns>
    [HttpGet("roles")]
    [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRoles(CancellationToken cancellationToken)
    {
        var result = await _userService.GetRolesAsync(cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        }
        return Ok(result.Value);
    }
}
