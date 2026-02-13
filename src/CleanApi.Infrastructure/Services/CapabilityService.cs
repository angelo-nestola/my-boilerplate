using CleanApi.Application.Common.Interfaces;
using CleanApi.Application.Common.Models;
using CleanApi.Application.Features.Organization;
using Microsoft.EntityFrameworkCore;

namespace CleanApi.Infrastructure.Services;

public class CapabilityService : ICapabilityService
{
    private readonly IApplicationDbContext _context;

    public CapabilityService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IEnumerable<CapabilityDto>>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var capabilities = await _context.Capabilities
            .AsNoTracking()
            .OrderBy(c => c.Group).ThenBy(c => c.Code)
            .Select(c => new CapabilityDto
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name,
                Description = c.Description,
                Group = c.Group
            })
            .ToListAsync(cancellationToken);

        return Result<IEnumerable<CapabilityDto>>.Success(capabilities);
    }

    public async Task<Result<IEnumerable<RoleCapabilityMatrixDto>>> GetRoleCapabilityMatrixAsync(CancellationToken cancellationToken = default)
    {
        var roles = await _context.OrgRoles
            .AsNoTracking()
            .Include(r => r.RoleCapabilities)
                .ThenInclude(rc => rc.Capability)
            .OrderBy(r => r.Name)
            .Select(r => new RoleCapabilityMatrixDto
            {
                RoleId = r.Id,
                RoleCode = r.Code,
                RoleName = r.Name,
                CapabilityCodes = r.RoleCapabilities.Select(rc => rc.Capability.Code).ToList()
            })
            .ToListAsync(cancellationToken);

        return Result<IEnumerable<RoleCapabilityMatrixDto>>.Success(roles);
    }

    public async Task<Result> UpdateRoleCapabilitiesAsync(Guid roleId, IEnumerable<Guid> capabilityIds, CancellationToken cancellationToken = default)
    {
        var role = await _context.OrgRoles
            .Include(r => r.RoleCapabilities)
            .FirstOrDefaultAsync(r => r.Id == roleId, cancellationToken);

        if (role == null)
            return Result.Failure("OrgRole not found");

        // Remove existing
        var existing = role.RoleCapabilities.ToList();
        foreach (var rc in existing)
            _context.RoleCapabilities.Remove(rc);

        // Add new
        var ids = capabilityIds.ToList();
        foreach (var capId in ids)
        {
            var capExists = await _context.Capabilities.AnyAsync(c => c.Id == capId, cancellationToken);
            if (!capExists)
                return Result.Failure($"Capability {capId} not found");

            _context.RoleCapabilities.Add(new Domain.Entities.RoleCapability
            {
                OrgRoleId = roleId,
                CapabilityId = capId
            });
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result<IEnumerable<string>>> GetUserCapabilitiesAsync(string userId, CancellationToken cancellationToken = default)
    {
        var person = await _context.Persons
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        if (person == null)
            return Result<IEnumerable<string>>.Success(Enumerable.Empty<string>());

        var capabilities = await _context.OrgAssignments
            .AsNoTracking()
            .Where(a => a.PersonId == person.Id && (a.ValidTo == null || a.ValidTo > DateTime.UtcNow))
            .SelectMany(a => a.OrgRole.RoleCapabilities)
            .Select(rc => rc.Capability.Code)
            .Distinct()
            .ToListAsync(cancellationToken);

        return Result<IEnumerable<string>>.Success(capabilities);
    }
}
