using CleanApi.Application.Features.Organization;
using CleanApi.Domain.Entities;
using CleanApi.Domain.Enums;
using CleanApi.Infrastructure.Data;
using CleanApi.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CleanApi.UnitTests.Organization;

public class OrgAssignmentServiceTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly OrgAssignmentService _service;
    private Person _person = null!;
    private OrgUnit _orgUnit = null!;
    private OrgRole _role = null!;

    public OrgAssignmentServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        _service = new OrgAssignmentService(_context);
        SeedData().GetAwaiter().GetResult();
    }

    private async Task SeedData()
    {
        _person = new Person { FirstName = "John", LastName = "Doe", Email = "john@test.com" };
        _orgUnit = new OrgUnit { Name = "Test Unit", Type = OrgUnitType.Orbit };
        _role = new OrgRole { Code = "BUSINESS_LEADER", Name = "Business Leader" };
        _context.Persons.Add(_person);
        _context.OrgUnits.Add(_orgUnit);
        _context.OrgRoles.Add(_role);
        await _context.SaveChangesAsync();
    }

    public void Dispose() => _context.Dispose();

    [Fact]
    public async Task CreateAsync_WithValidData_ShouldCreateAssignment()
    {
        var dto = new CreateOrgAssignmentDto
        {
            PersonId = _person.Id,
            OrgUnitId = _orgUnit.Id,
            OrgRoleId = _role.Id,
            ValidFrom = DateTime.UtcNow
        };

        var result = await _service.CreateAsync(dto);

        result.Succeeded.Should().BeTrue();
        result.Value!.PersonName.Should().Contain("John");
    }

    [Fact]
    public async Task CreateAsync_DuplicateActiveAssignment_ShouldFail()
    {
        var dto = new CreateOrgAssignmentDto
        {
            PersonId = _person.Id,
            OrgUnitId = _orgUnit.Id,
            OrgRoleId = _role.Id,
            ValidFrom = DateTime.UtcNow
        };

        await _service.CreateAsync(dto);
        var result = await _service.CreateAsync(dto);

        result.Succeeded.Should().BeFalse();
        result.Errors.Should().Contain(e => e.Contains("active assignment"));
    }

    [Fact]
    public async Task CreateAsync_NonExistentPerson_ShouldFail()
    {
        var dto = new CreateOrgAssignmentDto
        {
            PersonId = Guid.NewGuid(),
            OrgUnitId = _orgUnit.Id,
            OrgRoleId = _role.Id,
            ValidFrom = DateTime.UtcNow
        };

        var result = await _service.CreateAsync(dto);

        result.Succeeded.Should().BeFalse();
        result.Errors.Should().Contain(e => e.Contains("Person not found"));
    }

    [Fact]
    public async Task GetByPersonAsync_ShouldReturnPersonAssignments()
    {
        await _service.CreateAsync(new CreateOrgAssignmentDto
        {
            PersonId = _person.Id,
            OrgUnitId = _orgUnit.Id,
            OrgRoleId = _role.Id,
            ValidFrom = DateTime.UtcNow
        });

        var result = await _service.GetByPersonAsync(_person.Id);

        result.Succeeded.Should().BeTrue();
        result.Value!.Should().HaveCount(1);
    }
}
