using CleanApi.Application.Common.Interfaces;
using CleanApi.Application.Common.Models;
using CleanApi.Application.Features.Organization;
using CleanApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CleanApi.Infrastructure.Services;

public class OrgAssignmentService : IOrgAssignmentService
{
    private readonly IApplicationDbContext _context;

    public OrgAssignmentService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<OrgAssignmentDto>> CreateAsync(CreateOrgAssignmentDto dto, CancellationToken cancellationToken = default)
    {
        var personExists = await _context.Persons.AnyAsync(p => p.Id == dto.PersonId, cancellationToken);
        if (!personExists)
            return Result<OrgAssignmentDto>.Failure("Person not found");

        var unitExists = await _context.OrgUnits.AnyAsync(u => u.Id == dto.OrgUnitId, cancellationToken);
        if (!unitExists)
            return Result<OrgAssignmentDto>.Failure("OrgUnit not found");

        var roleExists = await _context.OrgRoles.AnyAsync(r => r.Id == dto.OrgRoleId, cancellationToken);
        if (!roleExists)
            return Result<OrgAssignmentDto>.Failure("OrgRole not found");

        // Check for duplicate active assignment
        var duplicate = await _context.OrgAssignments.AnyAsync(a =>
            a.PersonId == dto.PersonId &&
            a.OrgUnitId == dto.OrgUnitId &&
            a.OrgRoleId == dto.OrgRoleId &&
            (a.ValidTo == null || a.ValidTo > DateTime.UtcNow), cancellationToken);

        if (duplicate)
            return Result<OrgAssignmentDto>.Failure("This person already has an active assignment with this role in this unit");

        var assignment = new OrgAssignment
        {
            PersonId = dto.PersonId,
            OrgUnitId = dto.OrgUnitId,
            OrgRoleId = dto.OrgRoleId,
            ValidFrom = dto.ValidFrom,
            ValidTo = dto.ValidTo
        };

        _context.OrgAssignments.Add(assignment);
        await _context.SaveChangesAsync(cancellationToken);

        // Reload with navigation
        var created = await _context.OrgAssignments
            .AsNoTracking()
            .Include(a => a.Person)
            .Include(a => a.OrgUnit)
            .Include(a => a.OrgRole)
            .FirstAsync(a => a.Id == assignment.Id, cancellationToken);

        return Result<OrgAssignmentDto>.Success(MapToDto(created));
    }

    public async Task<Result<OrgAssignmentDto>> UpdateAsync(Guid id, UpdateOrgAssignmentDto dto, CancellationToken cancellationToken = default)
    {
        var assignment = await _context.OrgAssignments
            .Include(a => a.Person)
            .Include(a => a.OrgUnit)
            .Include(a => a.OrgRole)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        if (assignment == null)
            return Result<OrgAssignmentDto>.Failure("Assignment not found");

        if (dto.OrgRoleId.HasValue)
        {
            var roleExists = await _context.OrgRoles.AnyAsync(r => r.Id == dto.OrgRoleId.Value, cancellationToken);
            if (!roleExists)
                return Result<OrgAssignmentDto>.Failure("OrgRole not found");
            assignment.OrgRoleId = dto.OrgRoleId.Value;
        }

        if (dto.ValidFrom.HasValue) assignment.ValidFrom = dto.ValidFrom.Value;
        if (dto.ValidTo.HasValue) assignment.ValidTo = dto.ValidTo.Value;

        await _context.SaveChangesAsync(cancellationToken);

        // Reload role if changed
        if (dto.OrgRoleId.HasValue)
        {
            assignment = await _context.OrgAssignments
                .AsNoTracking()
                .Include(a => a.Person)
                .Include(a => a.OrgUnit)
                .Include(a => a.OrgRole)
                .FirstAsync(a => a.Id == id, cancellationToken);
        }

        return Result<OrgAssignmentDto>.Success(MapToDto(assignment));
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var assignment = await _context.OrgAssignments.FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
        if (assignment == null)
            return Result.Failure("Assignment not found");

        _context.OrgAssignments.Remove(assignment);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result<IEnumerable<OrgAssignmentDto>>> GetByPersonAsync(Guid personId, CancellationToken cancellationToken = default)
    {
        var personExists = await _context.Persons.AnyAsync(p => p.Id == personId, cancellationToken);
        if (!personExists)
            return Result<IEnumerable<OrgAssignmentDto>>.Failure("Person not found");

        var assignments = await _context.OrgAssignments
            .AsNoTracking()
            .Where(a => a.PersonId == personId)
            .Include(a => a.Person)
            .Include(a => a.OrgUnit)
            .Include(a => a.OrgRole)
            .OrderByDescending(a => a.ValidFrom)
            .Select(a => MapToDto(a))
            .ToListAsync(cancellationToken);

        return Result<IEnumerable<OrgAssignmentDto>>.Success(assignments);
    }

    private static OrgAssignmentDto MapToDto(OrgAssignment a) => new()
    {
        Id = a.Id,
        PersonId = a.PersonId,
        OrgUnitId = a.OrgUnitId,
        OrgRoleId = a.OrgRoleId,
        ValidFrom = a.ValidFrom,
        ValidTo = a.ValidTo,
        PersonName = a.Person.FirstName + " " + a.Person.LastName,
        OrgUnitName = a.OrgUnit.Name,
        RoleName = a.OrgRole.Name
    };
}
