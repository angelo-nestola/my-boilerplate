using CleanApi.Domain.Entities;
using CleanApi.Domain.Enums;
using CleanApi.Infrastructure.Data;
using CleanApi.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CleanApi.UnitTests.Organization;

public class SanityCheckTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly OrganizationDashboardService _service;

    public SanityCheckTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        _service = new OrganizationDashboardService(_context);
    }

    public void Dispose() => _context.Dispose();

    [Fact]
    public async Task RunSanityCheck_EmptyDb_AllChecksShouldFail()
    {
        var result = await _service.RunSanityCheckAsync();

        result.Succeeded.Should().BeTrue();
        var checks = result.Value!.ToList();
        checks.Should().HaveCount(4);
        checks.First(c => c.Code == "AC-ORG-01").Passed.Should().BeFalse();
        checks.First(c => c.Code == "AC-ORG-03").Passed.Should().BeFalse();
        checks.First(c => c.Code == "AC-ORG-04").Passed.Should().BeFalse();
        // AC-ORG-02 should pass (no inactive persons with assignments)
        checks.First(c => c.Code == "AC-ORG-02").Passed.Should().BeTrue();
    }

    [Fact]
    public async Task RunSanityCheck_WithOrbit_ACORG01ShouldPass()
    {
        _context.OrgUnits.Add(new OrgUnit { Name = "Orbit 1", Type = OrgUnitType.Orbit, Status = OrgUnitStatus.Active });
        await _context.SaveChangesAsync();

        var result = await _service.RunSanityCheckAsync();
        result.Value!.First(c => c.Code == "AC-ORG-01").Passed.Should().BeTrue();
    }

    [Fact]
    public async Task RunSanityCheck_WithTechnicalArchitect_ACORG03ShouldPass()
    {
        var role = new OrgRole { Code = "TECHNICAL_ARCHITECT", Name = "TA" };
        var person = new Person { FirstName = "A", LastName = "B", Email = "ta@test.com", Status = PersonStatus.Active };
        var unit = new OrgUnit { Name = "Unit", Type = OrgUnitType.Orbit, Status = OrgUnitStatus.Active };
        _context.OrgRoles.Add(role);
        _context.Persons.Add(person);
        _context.OrgUnits.Add(unit);
        await _context.SaveChangesAsync();

        _context.OrgAssignments.Add(new OrgAssignment
        {
            PersonId = person.Id,
            OrgUnitId = unit.Id,
            OrgRoleId = role.Id,
            ValidFrom = DateTime.UtcNow.AddDays(-1)
        });
        await _context.SaveChangesAsync();

        var result = await _service.RunSanityCheckAsync();
        result.Value!.First(c => c.Code == "AC-ORG-03").Passed.Should().BeTrue();
    }

    [Fact]
    public async Task RunSanityCheck_CCWithMember_ACORG04ShouldPass()
    {
        var role = new OrgRole { Code = "LEAD", Name = "Lead" };
        var person = new Person { FirstName = "A", LastName = "B", Email = "cc@test.com", Status = PersonStatus.Active };
        var cc = new OrgUnit { Name = "CC", Type = OrgUnitType.CompetenceCenter, Status = OrgUnitStatus.Active };
        _context.OrgRoles.Add(role);
        _context.Persons.Add(person);
        _context.OrgUnits.Add(cc);
        await _context.SaveChangesAsync();

        _context.OrgAssignments.Add(new OrgAssignment
        {
            PersonId = person.Id,
            OrgUnitId = cc.Id,
            OrgRoleId = role.Id,
            ValidFrom = DateTime.UtcNow.AddDays(-1)
        });
        await _context.SaveChangesAsync();

        var result = await _service.RunSanityCheckAsync();
        result.Value!.First(c => c.Code == "AC-ORG-04").Passed.Should().BeTrue();
    }

    [Fact]
    public async Task RunSanityCheck_InactivePersonWithActiveAssignment_ACORG02ShouldFail()
    {
        var role = new OrgRole { Code = "TEST", Name = "Test" };
        var person = new Person { FirstName = "A", LastName = "B", Email = "inactive@test.com", Status = PersonStatus.Inactive };
        var unit = new OrgUnit { Name = "Unit", Type = OrgUnitType.Orbit, Status = OrgUnitStatus.Active };
        _context.OrgRoles.Add(role);
        _context.Persons.Add(person);
        _context.OrgUnits.Add(unit);
        await _context.SaveChangesAsync();

        _context.OrgAssignments.Add(new OrgAssignment
        {
            PersonId = person.Id,
            OrgUnitId = unit.Id,
            OrgRoleId = role.Id,
            ValidFrom = DateTime.UtcNow.AddDays(-1)
        });
        await _context.SaveChangesAsync();

        var result = await _service.RunSanityCheckAsync();
        result.Value!.First(c => c.Code == "AC-ORG-02").Passed.Should().BeFalse();
    }

    [Fact]
    public async Task GetDashboardAsync_ShouldReturnCorrectCounts()
    {
        _context.OrgUnits.Add(new OrgUnit { Name = "O1", Type = OrgUnitType.Orbit, Status = OrgUnitStatus.Active });
        _context.OrgUnits.Add(new OrgUnit { Name = "O2", Type = OrgUnitType.Orbit, Status = OrgUnitStatus.Active });
        _context.OrgUnits.Add(new OrgUnit { Name = "CC1", Type = OrgUnitType.CompetenceCenter, Status = OrgUnitStatus.Active });
        _context.OrgUnits.Add(new OrgUnit { Name = "SG1", Type = OrgUnitType.StaffGroup, Status = OrgUnitStatus.Active });
        _context.Persons.Add(new Person { FirstName = "A", LastName = "B", Email = "a@t.com", Status = PersonStatus.Active });
        _context.Persons.Add(new Person { FirstName = "C", LastName = "D", Email = "c@t.com", Status = PersonStatus.Inactive });
        await _context.SaveChangesAsync();

        var result = await _service.GetDashboardAsync();

        result.Succeeded.Should().BeTrue();
        result.Value!.OrbitCount.Should().Be(2);
        result.Value.CcCount.Should().Be(1);
        result.Value.StaffGroupCount.Should().Be(1);
        result.Value.ActivePersonCount.Should().Be(1);
    }
}
