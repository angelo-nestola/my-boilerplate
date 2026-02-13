using CleanApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CleanApi.Infrastructure.Data.Configurations;

public class OrgAssignmentConfiguration : IEntityTypeConfiguration<OrgAssignment>
{
    public void Configure(EntityTypeBuilder<OrgAssignment> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CreatedBy).HasMaxLength(450);
        builder.Property(x => x.UpdatedBy).HasMaxLength(450);

        builder.HasIndex(x => new { x.PersonId, x.OrgUnitId, x.OrgRoleId, x.ValidFrom }).IsUnique();

        builder.HasOne(x => x.Person)
            .WithMany(p => p.OrgAssignments)
            .HasForeignKey(x => x.PersonId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.OrgUnit)
            .WithMany(u => u.Assignments)
            .HasForeignKey(x => x.OrgUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.OrgRole)
            .WithMany(r => r.Assignments)
            .HasForeignKey(x => x.OrgRoleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
