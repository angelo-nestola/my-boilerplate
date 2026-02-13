using System.Security.Claims;
using CleanApi.Application.Common.Interfaces;
using CleanApi.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace CleanApi.Infrastructure.Authorization;

public class CapabilityAuthorizationHandler : AuthorizationHandler<CapabilityRequirement>
{
    private readonly IApplicationDbContext _context;

    public CapabilityAuthorizationHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        CapabilityRequirement requirement)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return;

        var person = await _context.Persons
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId && p.Status == PersonStatus.Active);

        if (person == null)
            return;

        var hasCapability = await _context.OrgAssignments
            .AsNoTracking()
            .Where(a => a.PersonId == person.Id && (a.ValidTo == null || a.ValidTo > DateTime.UtcNow))
            .SelectMany(a => a.OrgRole.RoleCapabilities)
            .AnyAsync(rc => rc.Capability.Code == requirement.CapabilityCode);

        if (hasCapability)
            context.Succeed(requirement);
    }
}
