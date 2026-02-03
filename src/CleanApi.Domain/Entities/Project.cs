using CleanApi.Domain.Common;

namespace CleanApi.Domain.Entities;

/// <summary>
/// A project containing tasks and team members.
/// </summary>
public class Project : BaseEntity, ISoftDelete, IAuditable
{
    /// <summary>
    /// Name of the project.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Short code for the project (e.g., "PROJ", "API").
    /// Used as prefix for task numbers.
    /// </summary>
    public required string Code { get; set; }

    /// <summary>
    /// Description of the project.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Start date of the project.
    /// </summary>
    public DateTime? StartDate { get; set; }

    /// <summary>
    /// Target end date of the project.
    /// </summary>
    public DateTime? EndDate { get; set; }

    /// <summary>
    /// Whether the project is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Navigation property to project members.
    /// </summary>
    public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();

    /// <summary>
    /// Navigation property to project tasks.
    /// </summary>
    public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();

    // ISoftDelete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // IAuditable
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
