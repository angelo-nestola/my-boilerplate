using System.Security.Claims;
using CleanApi.Application.Common.Interfaces;
using CleanApi.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace CleanApi.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IServiceProvider _serviceProvider;
    private bool _resolved;
    private Guid? _personId;
    private List<string>? _capabilities;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor, IServiceProvider serviceProvider)
    {
        _httpContextAccessor = httpContextAccessor;
        _serviceProvider = serviceProvider;
    }

    public string? UserId => _httpContextAccessor.HttpContext?
        .User?.FindFirstValue(ClaimTypes.NameIdentifier);

    public string? Email => _httpContextAccessor.HttpContext?
        .User?.FindFirstValue(ClaimTypes.Email);

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?
        .User?.Identity?.IsAuthenticated ?? false;

    public Guid? PersonId
    {
        get
        {
            ResolveIfNeeded().GetAwaiter().GetResult();
            return _personId;
        }
    }

    public IReadOnlyList<string> Capabilities
    {
        get
        {
            ResolveIfNeeded().GetAwaiter().GetResult();
            return _capabilities ?? [];
        }
    }

    public async Task<bool> HasCapabilityAsync(string capabilityCode)
    {
        await ResolveIfNeeded();
        return _capabilities?.Contains(capabilityCode) ?? false;
    }

    private async Task ResolveIfNeeded()
    {
        if (_resolved) return;
        _resolved = true;

        var userId = UserId;
        if (string.IsNullOrEmpty(userId)) return;

        var context = _serviceProvider.GetRequiredService<IApplicationDbContext>();

        var person = await context.Persons
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId && p.Status == PersonStatus.Active);

        if (person == null) return;

        _personId = person.Id;
        _capabilities = await context.OrgAssignments
            .AsNoTracking()
            .Where(a => a.PersonId == person.Id && (a.ValidTo == null || a.ValidTo > DateTime.UtcNow))
            .SelectMany(a => a.OrgRole.RoleCapabilities)
            .Select(rc => rc.Capability.Code)
            .Distinct()
            .ToListAsync();
    }
}
