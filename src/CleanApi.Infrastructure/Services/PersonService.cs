using CleanApi.Application.Common.Interfaces;
using CleanApi.Application.Common.Models;
using CleanApi.Application.Features.Organization;
using CleanApi.Domain.Entities;
using CleanApi.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CleanApi.Infrastructure.Services;

public class PersonService : IPersonService
{
    private readonly IApplicationDbContext _context;

    public PersonService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IEnumerable<PersonListDto>>> GetAllAsync(string? searchTerm = null, bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Persons.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var search = searchTerm.ToLower();
            query = query.Where(p =>
                p.FirstName.ToLower().Contains(search) ||
                p.LastName.ToLower().Contains(search) ||
                p.Email.ToLower().Contains(search));
        }

        if (isActive.HasValue)
        {
            var status = isActive.Value ? PersonStatus.Active : PersonStatus.Inactive;
            query = query.Where(p => p.Status == status);
        }

        var persons = await query
            .OrderBy(p => p.LastName).ThenBy(p => p.FirstName)
            .Select(p => new PersonListDto
            {
                Id = p.Id,
                FirstName = p.FirstName,
                LastName = p.LastName,
                Email = p.Email,
                Status = p.Status,
                AssignmentCount = p.OrgAssignments.Count(a => a.ValidTo == null || a.ValidTo > DateTime.UtcNow)
            })
            .ToListAsync(cancellationToken);

        return Result<IEnumerable<PersonListDto>>.Success(persons);
    }

    public async Task<Result<PersonDetailDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var person = await _context.Persons
            .AsNoTracking()
            .Include(p => p.OrgAssignments).ThenInclude(a => a.OrgUnit)
            .Include(p => p.OrgAssignments).ThenInclude(a => a.OrgRole)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (person == null)
            return Result<PersonDetailDto>.Failure("Person not found");

        return Result<PersonDetailDto>.Success(new PersonDetailDto
        {
            Id = person.Id,
            FirstName = person.FirstName,
            LastName = person.LastName,
            Email = person.Email,
            Status = person.Status,
            Notes = person.Notes,
            UserId = person.UserId,
            CreatedAt = person.CreatedAt,
            UpdatedAt = person.UpdatedAt,
            Assignments = person.OrgAssignments
                .Where(a => a.ValidTo == null || a.ValidTo > DateTime.UtcNow)
                .Select(a => new OrgAssignmentDto
                {
                    Id = a.Id,
                    PersonId = a.PersonId,
                    OrgUnitId = a.OrgUnitId,
                    OrgRoleId = a.OrgRoleId,
                    ValidFrom = a.ValidFrom,
                    ValidTo = a.ValidTo,
                    PersonName = person.FirstName + " " + person.LastName,
                    OrgUnitName = a.OrgUnit.Name,
                    RoleName = a.OrgRole.Name
                }).ToList()
        });
    }

    public async Task<Result<PersonDto>> CreateAsync(CreatePersonDto dto, CancellationToken cancellationToken = default)
    {
        var emailExists = await _context.Persons.AnyAsync(p => p.Email == dto.Email, cancellationToken);
        if (emailExists)
            return Result<PersonDto>.Failure("A person with this email already exists");

        var person = new Person
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Notes = dto.Notes,
            UserId = dto.UserId
        };

        _context.Persons.Add(person);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<PersonDto>.Success(new PersonDto
        {
            Id = person.Id,
            FirstName = person.FirstName,
            LastName = person.LastName,
            Email = person.Email,
            Status = person.Status,
            Notes = person.Notes,
            UserId = person.UserId,
            CreatedAt = person.CreatedAt,
            UpdatedAt = person.UpdatedAt,
            AssignmentCount = 0
        });
    }

    public async Task<Result<PersonDto>> UpdateAsync(Guid id, UpdatePersonDto dto, CancellationToken cancellationToken = default)
    {
        var person = await _context.Persons
            .Include(p => p.OrgAssignments)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (person == null)
            return Result<PersonDto>.Failure("Person not found");

        if (dto.Email != null && dto.Email != person.Email)
        {
            var emailExists = await _context.Persons.AnyAsync(p => p.Email == dto.Email && p.Id != id, cancellationToken);
            if (emailExists)
                return Result<PersonDto>.Failure("A person with this email already exists");
            person.Email = dto.Email;
        }

        if (dto.FirstName != null) person.FirstName = dto.FirstName;
        if (dto.LastName != null) person.LastName = dto.LastName;
        if (dto.Notes != null) person.Notes = dto.Notes;
        if (dto.Status.HasValue) person.Status = dto.Status.Value;
        if (dto.UserId != null) person.UserId = dto.UserId;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<PersonDto>.Success(new PersonDto
        {
            Id = person.Id,
            FirstName = person.FirstName,
            LastName = person.LastName,
            Email = person.Email,
            Status = person.Status,
            Notes = person.Notes,
            UserId = person.UserId,
            CreatedAt = person.CreatedAt,
            UpdatedAt = person.UpdatedAt,
            AssignmentCount = person.OrgAssignments.Count(a => a.ValidTo == null || a.ValidTo > DateTime.UtcNow)
        });
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var person = await _context.Persons.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (person == null)
            return Result.Failure("Person not found");

        _context.Persons.Remove(person);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
