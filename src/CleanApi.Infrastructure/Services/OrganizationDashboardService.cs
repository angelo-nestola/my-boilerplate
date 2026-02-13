using CleanApi.Application.Common.Interfaces;
using CleanApi.Application.Common.Models;
using CleanApi.Application.Features.Organization;
using CleanApi.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CleanApi.Infrastructure.Services;

public class OrganizationDashboardService : IOrganizationDashboardService
{
    private readonly IApplicationDbContext _context;

    public OrganizationDashboardService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<OrgDashboardDto>> GetDashboardAsync(CancellationToken cancellationToken = default)
    {
        var orbitCount = await _context.OrgUnits.CountAsync(u => u.Type == OrgUnitType.Orbit && u.Status == OrgUnitStatus.Active, cancellationToken);
        var ccCount = await _context.OrgUnits.CountAsync(u => u.Type == OrgUnitType.CompetenceCenter && u.Status == OrgUnitStatus.Active, cancellationToken);
        var staffGroupCount = await _context.OrgUnits.CountAsync(u => u.Type == OrgUnitType.StaffGroup && u.Status == OrgUnitStatus.Active, cancellationToken);
        var techHubCount = await _context.OrgUnits.CountAsync(u => u.Type == OrgUnitType.TechnicalHub && u.Status == OrgUnitStatus.Active, cancellationToken);
        var activePersonCount = await _context.Persons.CountAsync(p => p.Status == PersonStatus.Active, cancellationToken);

        var sanityResult = await RunSanityCheckAsync(cancellationToken);

        return Result<OrgDashboardDto>.Success(new OrgDashboardDto
        {
            OrbitCount = orbitCount,
            CcCount = ccCount,
            StaffGroupCount = staffGroupCount,
            TechHubCount = techHubCount,
            ActivePersonCount = activePersonCount,
            SanityChecks = sanityResult.Succeeded ? sanityResult.Value!.ToList() : []
        });
    }

    public async Task<Result<IEnumerable<SanityCheckResultDto>>> RunSanityCheckAsync(CancellationToken cancellationToken = default)
    {
        var checks = new List<SanityCheckResultDto>();

        // AC-ORG-01: At least one active Orbit
        var hasOrbit = await _context.OrgUnits.AnyAsync(u => u.Type == OrgUnitType.Orbit && u.Status == OrgUnitStatus.Active, cancellationToken);
        checks.Add(new SanityCheckResultDto
        {
            Code = "AC-ORG-01",
            Description = "At least one active Orbit must exist",
            Passed = hasOrbit
        });

        // AC-ORG-03: At least one Technical Architect assigned
        var hasTa = await _context.OrgAssignments
            .AnyAsync(a =>
                a.OrgRole.Code == "TECHNICAL_ARCHITECT" &&
                (a.ValidTo == null || a.ValidTo > DateTime.UtcNow) &&
                a.Person.Status == PersonStatus.Active, cancellationToken);
        checks.Add(new SanityCheckResultDto
        {
            Code = "AC-ORG-03",
            Description = "At least one Technical Architect must be assigned",
            Passed = hasTa
        });

        // AC-ORG-04: Command Center (CompetenceCenter type) must exist with at least 1 member
        var ccWithMembers = await _context.OrgUnits
            .AnyAsync(u =>
                u.Type == OrgUnitType.CompetenceCenter &&
                u.Status == OrgUnitStatus.Active &&
                u.Assignments.Any(a => a.ValidTo == null || a.ValidTo > DateTime.UtcNow), cancellationToken);
        checks.Add(new SanityCheckResultDto
        {
            Code = "AC-ORG-04",
            Description = "At least one Competence Center must exist with active members",
            Passed = ccWithMembers
        });

        // AC-ORG-02: No inactive persons with active assignments
        var inactiveWithAssignments = await _context.Persons
            .AnyAsync(p =>
                p.Status == PersonStatus.Inactive &&
                p.OrgAssignments.Any(a => a.ValidTo == null || a.ValidTo > DateTime.UtcNow), cancellationToken);
        checks.Add(new SanityCheckResultDto
        {
            Code = "AC-ORG-02",
            Description = "No inactive persons should have active assignments",
            Passed = !inactiveWithAssignments
        });

        return Result<IEnumerable<SanityCheckResultDto>>.Success(checks);
    }
}
