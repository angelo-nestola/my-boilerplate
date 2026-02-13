using CleanApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CleanApi.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Person> Persons { get; }
    DbSet<OrgUnit> OrgUnits { get; }
    DbSet<OrgRole> OrgRoles { get; }
    DbSet<OrgAssignment> OrgAssignments { get; }
    DbSet<Capability> Capabilities { get; }
    DbSet<RoleCapability> RoleCapabilities { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
