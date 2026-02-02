namespace CleanApi.Application.Common.Interfaces;

/// <summary>
/// Interface for JWT token operations.
/// Implemented by Infrastructure layer.
/// </summary>
public interface IJwtService
{
    /// <summary>
    /// Generates a JWT access token for the specified user.
    /// </summary>
    /// <param name="userId">The user's unique identifier.</param>
    /// <param name="email">The user's email address.</param>
    /// <returns>The generated JWT token string.</returns>
    string GenerateAccessToken(string userId, string email);

    /// <summary>
    /// Generates a refresh token.
    /// </summary>
    /// <returns>A secure random refresh token string.</returns>
    string GenerateRefreshToken();

    /// <summary>
    /// Validates a JWT token and extracts the user ID.
    /// </summary>
    /// <param name="token">The JWT token to validate.</param>
    /// <returns>The user ID if valid, null otherwise.</returns>
    string? ValidateToken(string token);
}
