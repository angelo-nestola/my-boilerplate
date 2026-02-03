namespace CleanApi.Application.Features.Users;

/// <summary>
/// DTO representing a user.
/// </summary>
public record UserDto
{
    public required string Id { get; init; }
    public required string Email { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? PhoneNumber { get; init; }
    public bool EmailConfirmed { get; init; }
    public bool IsActive { get; init; }
    public DateTime? CreatedAt { get; init; }
    public IEnumerable<string> Roles { get; init; } = [];

    /// <summary>
    /// Full name computed from FirstName and LastName.
    /// </summary>
    public string FullName => string.IsNullOrWhiteSpace(FirstName) && string.IsNullOrWhiteSpace(LastName)
        ? Email
        : $"{FirstName} {LastName}".Trim();
}

/// <summary>
/// DTO for creating a new user.
/// </summary>
public record CreateUserDto
{
    public required string Email { get; init; }
    public required string Password { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? PhoneNumber { get; init; }
    public IEnumerable<string> Roles { get; init; } = [];
}

/// <summary>
/// DTO for updating user information.
/// </summary>
public record UpdateUserDto
{
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? PhoneNumber { get; init; }
    public bool? IsActive { get; init; }
    public IEnumerable<string>? Roles { get; init; }
}

/// <summary>
/// DTO for updating user password.
/// </summary>
public record ChangePasswordDto
{
    public required string NewPassword { get; init; }
}
