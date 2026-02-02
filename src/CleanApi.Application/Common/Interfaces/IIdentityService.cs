using CleanApi.Application.Common.Models;

namespace CleanApi.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<Result<string>> CreateUserAsync(string email, string password);
    Task<Result<AuthResult>> LoginAsync(string email, string password);
    Task<Result<AuthResult>> RefreshTokenAsync(string accessToken, string refreshToken);
    Task<Result> RevokeRefreshTokenAsync(string userId);
    Task<bool> UserExistsAsync(string email);
    Task<string?> GetUserNameAsync(string userId);
}

public class AuthResult
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}
