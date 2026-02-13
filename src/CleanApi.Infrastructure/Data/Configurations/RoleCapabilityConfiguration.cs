using CleanApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CleanApi.Infrastructure.Data.Configurations;

public class RoleCapabilityConfiguration : IEntityTypeConfiguration<RoleCapability>
{
    public void Configure(EntityTypeBuilder<RoleCapability> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => new { x.OrgRoleId, x.CapabilityId }).IsUnique();

        builder.HasOne(x => x.OrgRole)
            .WithMany(r => r.RoleCapabilities)
            .HasForeignKey(x => x.OrgRoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Capability)
            .WithMany(c => c.RoleCapabilities)
            .HasForeignKey(x => x.CapabilityId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
