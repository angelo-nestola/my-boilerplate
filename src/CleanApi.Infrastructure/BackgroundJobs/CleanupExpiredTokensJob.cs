using CleanApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CleanApi.Infrastructure.BackgroundJobs;

public class CleanupExpiredTokensJob
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CleanupExpiredTokensJob> _logger;

    public CleanupExpiredTokensJob(ApplicationDbContext context, ILogger<CleanupExpiredTokensJob> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting cleanup of expired refresh tokens");

        var expiredUsers = await _context.Users
            .Where(u => u.RefreshTokenExpiryTime != null && u.RefreshTokenExpiryTime < DateTime.UtcNow)
            .ToListAsync();

        foreach (var user in expiredUsers)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
        }

        var count = await _context.SaveChangesAsync();

        _logger.LogInformation("Cleaned up {Count} expired refresh tokens", count);
    }
}
