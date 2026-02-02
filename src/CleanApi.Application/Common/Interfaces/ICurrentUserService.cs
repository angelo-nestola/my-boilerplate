namespace CleanApi.Application.Common.Interfaces;

/// <summary>
/// Interface for accessing the current authenticated user's information.
/// Implemented by Infrastructure layer to extract user from HTTP context/JWT.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Gets the current user's unique identifier.
    /// Returns null if the user is not authenticated.
    /// </summary>
    string? UserId { get; }

    /// <summary>
    /// Gets the current user's email address.
    /// Returns null if the user is not authenticated.
    /// </summary>
    string? Email { get; }

    /// <summary>
    /// Indicates whether the current user is authenticated.
    /// </summary>
    bool IsAuthenticated { get; }
}
