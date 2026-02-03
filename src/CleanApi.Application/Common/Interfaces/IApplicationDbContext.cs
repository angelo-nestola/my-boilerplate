using CleanApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CleanApi.Application.Common.Interfaces;

/// <summary>
/// Interface for the application database context.
/// Implemented by Infrastructure layer to provide EF Core DbContext.
/// </summary>
public interface IApplicationDbContext
{
    /// <summary>
    /// Task categories for organizing tasks.
    /// </summary>
    DbSet<TaskCategory> TaskCategories { get; }

    /// <summary>
    /// Projects containing tasks and members.
    /// </summary>
    DbSet<Project> Projects { get; }

    /// <summary>
    /// Project membership records.
    /// </summary>
    DbSet<ProjectMember> ProjectMembers { get; }

    /// <summary>
    /// Tasks within projects.
    /// </summary>
    DbSet<ProjectTask> ProjectTasks { get; }

    /// <summary>
    /// Saves all changes made in this context to the database.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The number of state entries written to the database.</returns>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
