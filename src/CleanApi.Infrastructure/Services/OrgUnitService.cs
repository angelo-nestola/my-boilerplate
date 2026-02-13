using CleanApi.Application.Common.Interfaces;
using CleanApi.Application.Common.Models;
using CleanApi.Application.Features.Organization;
using CleanApi.Domain.Entities;
using CleanApi.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CleanApi.Infrastructure.Services;

public class OrgUnitService : IOrgUnitService
{
    private readonly IApplicationDbContext _context;

    public OrgUnitService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IEnumerable<OrgUnitListDto>>> GetAllAsync(string? searchTerm = null, OrgUnitType? type = null, CancellationToken cancellationToken = default)
    {
        var query = _context.OrgUnits.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var search = searchTerm.ToLower();
            query = query.Where(u => u.Code.ToLower().Contains(search) ||
                u.Name.ToLower().Contains(search) ||
                (u.Description != null && u.Description.ToLower().Contains(search)));
        }

        if (type.HasValue)
            query = query.Where(u => u.Type == type.Value);

        var units = await query
            .OrderBy(u => u.Name)
            .Select(u => new OrgUnitListDto
            {
                Id = u.Id,
                Code = u.Code,
                Name = u.Name,
                Type = u.Type,
                Domain = u.Domain,
                Status = u.Status,
                ParentId = u.ParentId,
                ParentName = u.Parent != null ? u.Parent.Name : null,
                MemberCount = u.Assignments.Count(a => a.ValidTo == null || a.ValidTo > DateTime.UtcNow)
            })
            .ToListAsync(cancellationToken);

        return Result<IEnumerable<OrgUnitListDto>>.Success(units);
    }

    public async Task<Result<IEnumerable<OrgUnitTreeNodeDto>>> GetTreeAsync(CancellationToken cancellationToken = default)
    {
        var allUnits = await _context.OrgUnits
            .AsNoTracking()
            .Where(u => u.Status == OrgUnitStatus.Active)
            .Select(u => new
            {
                u.Id,
                u.Code,
                u.Name,
                u.Type,
                u.Status,
                u.Domain,
                u.ParentId,
                MemberCount = u.Assignments.Count(a => a.ValidTo == null || a.ValidTo > DateTime.UtcNow)
            })
            .ToListAsync(cancellationToken);

        var lookup = allUnits.ToLookup(u => u.ParentId);

        OrgUnitTreeNodeDto BuildNode(Guid id, string code, string name, OrgUnitType type, OrgUnitStatus status, string? domain, int memberCount)
        {
            var children = lookup[id]
                .OrderBy(c => c.Type)
                .ThenBy(c => c.Name)
                .Select(c => BuildNode(c.Id, c.Code, c.Name, c.Type, c.Status, c.Domain, c.MemberCount))
                .ToList();

            return new OrgUnitTreeNodeDto
            {
                Id = id,
                Code = code,
                Name = name,
                Type = type,
                Status = status,
                Domain = domain,
                MemberCount = memberCount,
                Children = children
            };
        }

        var roots = lookup[null]
            .OrderBy(u => u.Type)
            .ThenBy(u => u.Name)
            .Select(u => BuildNode(u.Id, u.Code, u.Name, u.Type, u.Status, u.Domain, u.MemberCount))
            .ToList();

        return Result<IEnumerable<OrgUnitTreeNodeDto>>.Success(roots);
    }

    public async Task<Result<OrgUnitDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var unit = await _context.OrgUnits
            .AsNoTracking()
            .Include(u => u.Parent)
            .Include(u => u.Children)
            .Include(u => u.Assignments)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

        if (unit == null)
            return Result<OrgUnitDto>.Failure("OrgUnit not found");

        return Result<OrgUnitDto>.Success(new OrgUnitDto
        {
            Id = unit.Id,
            Code = unit.Code,
            Name = unit.Name,
            Type = unit.Type,
            Description = unit.Description,
            Domain = unit.Domain,
            Status = unit.Status,
            ParentId = unit.ParentId,
            ParentName = unit.Parent?.Name,
            CreatedAt = unit.CreatedAt,
            UpdatedAt = unit.UpdatedAt,
            MemberCount = unit.Assignments.Count(a => a.ValidTo == null || a.ValidTo > DateTime.UtcNow),
            ChildCount = unit.Children.Count
        });
    }

    public async Task<Result<IEnumerable<OrgAssignmentDto>>> GetMembersAsync(Guid orgUnitId, CancellationToken cancellationToken = default)
    {
        var exists = await _context.OrgUnits.AnyAsync(u => u.Id == orgUnitId, cancellationToken);
        if (!exists)
            return Result<IEnumerable<OrgAssignmentDto>>.Failure("OrgUnit not found");

        var members = await _context.OrgAssignments
            .AsNoTracking()
            .Where(a => a.OrgUnitId == orgUnitId && (a.ValidTo == null || a.ValidTo > DateTime.UtcNow))
            .Include(a => a.Person)
            .Include(a => a.OrgRole)
            .OrderBy(a => a.Person.LastName)
            .Select(a => new OrgAssignmentDto
            {
                Id = a.Id,
                PersonId = a.PersonId,
                OrgUnitId = a.OrgUnitId,
                OrgRoleId = a.OrgRoleId,
                ValidFrom = a.ValidFrom,
                ValidTo = a.ValidTo,
                PersonName = a.Person.FirstName + " " + a.Person.LastName,
                OrgUnitName = "",
                RoleName = a.OrgRole.Name
            })
            .ToListAsync(cancellationToken);

        return Result<IEnumerable<OrgAssignmentDto>>.Success(members);
    }

    public async Task<Result<OrgUnitDto>> CreateAsync(CreateOrgUnitDto dto, CancellationToken cancellationToken = default)
    {
        var exists = await _context.OrgUnits.AnyAsync(u => u.Name == dto.Name && u.Type == dto.Type, cancellationToken);
        if (exists)
            return Result<OrgUnitDto>.Failure("An OrgUnit with this name and type already exists");

        if (dto.ParentId.HasValue)
        {
            var parentExists = await _context.OrgUnits.AnyAsync(u => u.Id == dto.ParentId.Value, cancellationToken);
            if (!parentExists)
                return Result<OrgUnitDto>.Failure("Parent OrgUnit not found");
        }

        var unit = new OrgUnit
        {
            Code = dto.Code,
            Name = dto.Name,
            Type = dto.Type,
            Description = dto.Description,
            Domain = dto.Domain,
            ParentId = dto.ParentId
        };

        _context.OrgUnits.Add(unit);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<OrgUnitDto>.Success(new OrgUnitDto
        {
            Id = unit.Id,
            Code = unit.Code,
            Name = unit.Name,
            Type = unit.Type,
            Description = unit.Description,
            Domain = unit.Domain,
            Status = unit.Status,
            ParentId = unit.ParentId,
            CreatedAt = unit.CreatedAt,
            UpdatedAt = unit.UpdatedAt,
            MemberCount = 0,
            ChildCount = 0
        });
    }

    public async Task<Result<OrgUnitDto>> UpdateAsync(Guid id, UpdateOrgUnitDto dto, CancellationToken cancellationToken = default)
    {
        var unit = await _context.OrgUnits
            .Include(u => u.Parent)
            .Include(u => u.Children)
            .Include(u => u.Assignments)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

        if (unit == null)
            return Result<OrgUnitDto>.Failure("OrgUnit not found");

        if (dto.Name != null) unit.Name = dto.Name;
        if (dto.Description != null) unit.Description = dto.Description;
        if (dto.Domain != null) unit.Domain = dto.Domain;
        if (dto.Status.HasValue) unit.Status = dto.Status.Value;
        if (dto.ParentId.HasValue)
        {
            if (dto.ParentId.Value == id)
                return Result<OrgUnitDto>.Failure("An OrgUnit cannot be its own parent");
            var parentExists = await _context.OrgUnits.AnyAsync(u => u.Id == dto.ParentId.Value, cancellationToken);
            if (!parentExists)
                return Result<OrgUnitDto>.Failure("Parent OrgUnit not found");
            unit.ParentId = dto.ParentId.Value;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<OrgUnitDto>.Success(new OrgUnitDto
        {
            Id = unit.Id,
            Code = unit.Code,
            Name = unit.Name,
            Type = unit.Type,
            Description = unit.Description,
            Domain = unit.Domain,
            Status = unit.Status,
            ParentId = unit.ParentId,
            ParentName = unit.Parent?.Name,
            CreatedAt = unit.CreatedAt,
            UpdatedAt = unit.UpdatedAt,
            MemberCount = unit.Assignments.Count(a => a.ValidTo == null || a.ValidTo > DateTime.UtcNow),
            ChildCount = unit.Children.Count
        });
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var unit = await _context.OrgUnits
            .Include(u => u.Assignments)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

        if (unit == null)
            return Result.Failure("OrgUnit not found");

        if (unit.Assignments.Any(a => a.ValidTo == null || a.ValidTo > DateTime.UtcNow))
            return Result.Failure("Cannot delete an OrgUnit with active assignments");

        _context.OrgUnits.Remove(unit);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
