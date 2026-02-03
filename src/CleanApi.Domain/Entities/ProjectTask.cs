using CleanApi.Domain.Common;
using CleanApi.Domain.Enums;

namespace CleanApi.Domain.Entities;

/// <summary>
/// A task within a project.
/// </summary>
public class ProjectTask : BaseEntity, ISoftDelete, IAuditable
{
    /// <summary>
    /// Project this task belongs to.
    /// </summary>
    public Guid ProjectId { get; set; }

    /// <summary>
    /// Navigation property to the project.
    /// </summary>
    public Project Project { get; set; } = null!;

    /// <summary>
    /// Sequential number within the project (e.g., 1, 2, 3).
    /// Combined with project code for display (e.g., "PROJ-123").
    /// </summary>
    public int TaskNumber { get; set; }

    /// <summary>
    /// Title of the task.
    /// </summary>
    public required string Title { get; set; }

    /// <summary>
    /// Detailed description of the task.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Current status of the task.
    /// </summary>
    public ProjectTaskStatus Status { get; set; } = ProjectTaskStatus.Backlog;

    /// <summary>
    /// Priority level of the task.
    /// </summary>
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    /// <summary>
    /// Category of the task.
    /// </summary>
    public Guid? CategoryId { get; set; }

    /// <summary>
    /// Navigation property to the category.
    /// </summary>
    public TaskCategory? Category { get; set; }

    /// <summary>
    /// User ID of the person assigned to this task.
    /// </summary>
    public string? AssigneeId { get; set; }

    /// <summary>
    /// User ID of the person who reported/created this task.
    /// </summary>
    public string? ReporterId { get; set; }

    /// <summary>
    /// Estimated effort in hours.
    /// </summary>
    public decimal? EstimatedHours { get; set; }

    /// <summary>
    /// Actual hours spent on this task.
    /// </summary>
    public decimal? ActualHours { get; set; }

    /// <summary>
    /// Due date for the task.
    /// </summary>
    public DateTime? DueDate { get; set; }

    /// <summary>
    /// Date when the task was started.
    /// </summary>
    public DateTime? StartedAt { get; set; }

    /// <summary>
    /// Date when the task was completed.
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    // ISoftDelete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // IAuditable
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
