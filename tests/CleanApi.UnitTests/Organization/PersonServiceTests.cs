using CleanApi.Application.Features.Organization;
using CleanApi.Domain.Entities;
using CleanApi.Domain.Enums;
using CleanApi.Infrastructure.Data;
using CleanApi.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CleanApi.UnitTests.Organization;

public class PersonServiceTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly PersonService _service;

    public PersonServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        _service = new PersonService(_context);
    }

    public void Dispose() => _context.Dispose();

    [Fact]
    public async Task CreateAsync_WithValidData_ShouldCreatePerson()
    {
        var dto = new CreatePersonDto { FirstName = "Jane", LastName = "Doe", Email = "jane@test.com" };

        var result = await _service.CreateAsync(dto);

        result.Succeeded.Should().BeTrue();
        result.Value!.FirstName.Should().Be("Jane");
        result.Value.Status.Should().Be(PersonStatus.Active);
    }

    [Fact]
    public async Task CreateAsync_DuplicateEmail_ShouldFail()
    {
        await _service.CreateAsync(new CreatePersonDto { FirstName = "A", LastName = "B", Email = "dup@test.com" });

        var result = await _service.CreateAsync(new CreatePersonDto { FirstName = "C", LastName = "D", Email = "dup@test.com" });

        result.Succeeded.Should().BeFalse();
        result.Errors.Should().Contain(e => e.Contains("email"));
    }

    [Fact]
    public async Task UpdateAsync_ChangeEmail_ShouldUpdateWhenUnique()
    {
        var created = await _service.CreateAsync(new CreatePersonDto { FirstName = "A", LastName = "B", Email = "a@test.com" });
        var id = created.Value!.Id;

        var result = await _service.UpdateAsync(id, new UpdatePersonDto { Email = "new@test.com" });

        result.Succeeded.Should().BeTrue();
        result.Value!.Email.Should().Be("new@test.com");
    }

    [Fact]
    public async Task GetAllAsync_WithStatusFilter_ShouldReturnFiltered()
    {
        await _service.CreateAsync(new CreatePersonDto { FirstName = "Active", LastName = "P", Email = "active@test.com" });
        var inactive = await _service.CreateAsync(new CreatePersonDto { FirstName = "Inactive", LastName = "P", Email = "inactive@test.com" });
        await _service.UpdateAsync(inactive.Value!.Id, new UpdatePersonDto { Status = PersonStatus.Inactive });

        var result = await _service.GetAllAsync(isActive: true);

        result.Succeeded.Should().BeTrue();
        result.Value!.Should().HaveCount(1);
        result.Value!.First().FirstName.Should().Be("Active");
    }
}
