using CleanApi.Application.Features.Organization;
using CleanApi.Domain.Entities;
using CleanApi.Domain.Enums;
using CleanApi.Infrastructure.Data;
using CleanApi.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CleanApi.UnitTests.Organization;

public class OrgUnitServiceTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly OrgUnitService _service;

    public OrgUnitServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        _service = new OrgUnitService(_context);
    }

    public void Dispose() => _context.Dispose();

    [Fact]
    public async Task CreateAsync_WithValidData_ShouldCreateOrgUnit()
    {
        var dto = new CreateOrgUnitDto { Name = "Test Orbit", Type = OrgUnitType.Orbit, Domain = "Finance" };

        var result = await _service.CreateAsync(dto);

        result.Succeeded.Should().BeTrue();
        result.Value!.Name.Should().Be("Test Orbit");
        result.Value.Type.Should().Be(OrgUnitType.Orbit);
    }

    [Fact]
    public async Task CreateAsync_DuplicateNameAndType_ShouldFail()
    {
        var dto = new CreateOrgUnitDto { Name = "Test CC", Type = OrgUnitType.CompetenceCenter };
        await _service.CreateAsync(dto);

        var result = await _service.CreateAsync(dto);

        result.Succeeded.Should().BeFalse();
        result.Errors.Should().Contain(e => e.Contains("already exists"));
    }

    [Fact]
    public async Task GetAllAsync_WithTypeFilter_ShouldReturnFiltered()
    {
        await _service.CreateAsync(new CreateOrgUnitDto { Name = "Orbit 1", Type = OrgUnitType.Orbit });
        await _service.CreateAsync(new CreateOrgUnitDto { Name = "CC 1", Type = OrgUnitType.CompetenceCenter });

        var result = await _service.GetAllAsync(type: OrgUnitType.Orbit);

        result.Succeeded.Should().BeTrue();
        result.Value!.Should().HaveCount(1);
        result.Value!.First().Type.Should().Be(OrgUnitType.Orbit);
    }

    [Fact]
    public async Task DeleteAsync_WithActiveAssignments_ShouldFail()
    {
        var unit = new OrgUnit { Name = "Test", Type = OrgUnitType.Orbit };
        _context.OrgUnits.Add(unit);
        var role = new OrgRole { Code = "TEST", Name = "Test" };
        _context.OrgRoles.Add(role);
        var person = new Person { FirstName = "John", LastName = "Doe", Email = "john@test.com" };
        _context.Persons.Add(person);
        await _context.SaveChangesAsync();

        _context.OrgAssignments.Add(new OrgAssignment
        {
            PersonId = person.Id,
            OrgUnitId = unit.Id,
            OrgRoleId = role.Id,
            ValidFrom = DateTime.UtcNow.AddDays(-1)
        });
        await _context.SaveChangesAsync();

        var result = await _service.DeleteAsync(unit.Id);

        result.Succeeded.Should().BeFalse();
        result.Errors.Should().Contain(e => e.Contains("active assignments"));
    }

    [Fact]
    public async Task GetByIdAsync_NonExistent_ShouldFail()
    {
        var result = await _service.GetByIdAsync(Guid.NewGuid());

        result.Succeeded.Should().BeFalse();
    }
}
