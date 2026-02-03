using CleanApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CleanApi.Infrastructure.Data.Configurations;

public class ProjectTaskConfiguration : IEntityTypeConfiguration<ProjectTask>
{
    public void Configure(EntityTypeBuilder<ProjectTask> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.Description)
            .HasMaxLength(4000);

        builder.Property(x => x.AssigneeId)
            .HasMaxLength(450);

        builder.Property(x => x.ReporterId)
            .HasMaxLength(450);

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(450);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(450);

        builder.Property(x => x.EstimatedHours)
            .HasPrecision(10, 2);

        builder.Property(x => x.ActualHours)
            .HasPrecision(10, 2);

        // Relationship with Project
        builder.HasOne(x => x.Project)
            .WithMany(x => x.Tasks)
            .HasForeignKey(x => x.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relationship with Category
        builder.HasOne(x => x.Category)
            .WithMany(x => x.Tasks)
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        // Unique constraint: task number per project
        builder.HasIndex(x => new { x.ProjectId, x.TaskNumber })
            .IsUnique();

        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.Priority);
        builder.HasIndex(x => x.AssigneeId);
        builder.HasIndex(x => x.DueDate);
    }
}
