using CleanApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CleanApi.Infrastructure.Data.Configurations;

public class OrgRoleConfiguration : IEntityTypeConfiguration<OrgRole>
{
    public void Configure(EntityTypeBuilder<OrgRole> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).HasMaxLength(2000);

        builder.HasIndex(x => x.Code).IsUnique();
        builder.HasIndex(x => x.Name).IsUnique();
    }
}
