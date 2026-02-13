using CleanApi.Domain.Entities;
using CleanApi.Domain.Enums;
using CleanApi.Infrastructure.Data;
using CleanApi.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CleanApi.UnitTests.Organization;

public class CapabilityServiceTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly CapabilityService _service;

    public CapabilityServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        _service = new CapabilityService(_context);
    }

    public void Dispose() => _context.Dispose();

    [Fact]
    public async Task GetUserCapabilitiesAsync_WithActiveAssignment_ShouldReturnCapabilities()
    {
        var cap = new Capability { Code = "MISSION_VIEW", Name = "View", Group = "Mission" };
        var role = new OrgRole { Code = "BL", Name = "Business Leader" };
        var person = new Person { FirstName = "A", LastName = "B", Email = "a@test.com", UserId = "user-123" };
        _context.Capabilities.Add(cap);
        _context.OrgRoles.Add(role);
        _context.Persons.Add(person);
        await _context.SaveChangesAsync();

        _context.RoleCapabilities.Add(new RoleCapability { OrgRoleId = role.Id, CapabilityId = cap.Id });
        var unit = new OrgUnit { Name = "Unit", Type = OrgUnitType.Orbit };
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

        var result = await _service.GetUserCapabilitiesAsync("user-123");

        result.Succeeded.Should().BeTrue();
        result.Value!.Should().Contain("MISSION_VIEW");
    }

    [Fact]
    public async Task GetUserCapabilitiesAsync_NoPersonLinked_ShouldReturnEmpty()
    {
        var result = await _service.GetUserCapabilitiesAsync("nonexistent-user");

        result.Succeeded.Should().BeTrue();
        result.Value!.Should().BeEmpty();
    }

    [Fact]
    public async Task UpdateRoleCapabilitiesAsync_ShouldReplaceCapabilities()
    {
        var cap1 = new Capability { Code = "CAP1", Name = "Cap 1", Group = "Test" };
        var cap2 = new Capability { Code = "CAP2", Name = "Cap 2", Group = "Test" };
        var role = new OrgRole { Code = "ROLE", Name = "Role" };
        _context.Capabilities.AddRange(cap1, cap2);
        _context.OrgRoles.Add(role);
        await _context.SaveChangesAsync();

        _context.RoleCapabilities.Add(new RoleCapability { OrgRoleId = role.Id, CapabilityId = cap1.Id });
        await _context.SaveChangesAsync();

        var result = await _service.UpdateRoleCapabilitiesAsync(role.Id, [cap2.Id]);

        result.Succeeded.Should().BeTrue();

        var matrix = await _service.GetRoleCapabilityMatrixAsync();
        var updatedRole = matrix.Value!.First(r => r.RoleId == role.Id);
        updatedRole.CapabilityCodes.Should().Contain("CAP2");
        updatedRole.CapabilityCodes.Should().NotContain("CAP1");
    }
}
