using System.Linq.Expressions;
using CleanApi.Application.Common.Interfaces;
using CleanApi.Domain.Common;
using CleanApi.Domain.Entities;
using CleanApi.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CleanApi.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Person> Persons => Set<Person>();
    public DbSet<OrgUnit> OrgUnits => Set<OrgUnit>();
    public DbSet<OrgRole> OrgRoles => Set<OrgRole>();
    public DbSet<OrgAssignment> OrgAssignments => Set<OrgAssignment>();
    public DbSet<Capability> Capabilities => Set<Capability>();
    public DbSet<RoleCapability> RoleCapabilities => Set<RoleCapability>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Configure global query filter for soft delete
        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            if (typeof(ISoftDelete).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var property = Expression.Property(parameter, nameof(ISoftDelete.IsDeleted));
                var falseConstant = Expression.Constant(false);
                var comparison = Expression.Equal(property, falseConstant);
                var lambda = Expression.Lambda(comparison, parameter);

                builder.Entity(entityType.ClrType).HasQueryFilter(lambda);
            }
        }
    }
}
