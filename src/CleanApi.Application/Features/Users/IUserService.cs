using CleanApi.Application.Common.Models;

namespace CleanApi.Application.Features.Users;

/// <summary>
/// Service for managing users.
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Gets all users with optional filtering.
    /// </summary>
    Task<Result<IEnumerable<UserDto>>> GetAllAsync(string? searchTerm = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a user by ID.
    /// </summary>
    Task<Result<UserDto>> GetByIdAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new user.
    /// </summary>
    Task<Result<UserDto>> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing user.
    /// </summary>
    Task<Result<UserDto>> UpdateAsync(string userId, UpdateUserDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Changes a user's password.
    /// </summary>
    Task<Result> ChangePasswordAsync(string userId, ChangePasswordDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a user.
    /// </summary>
    Task<Result> DeleteAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets available roles.
    /// </summary>
    Task<Result<IEnumerable<string>>> GetRolesAsync(CancellationToken cancellationToken = default);
}
