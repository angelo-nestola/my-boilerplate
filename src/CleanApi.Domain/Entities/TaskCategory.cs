using CleanApi.Domain.Common;

namespace CleanApi.Domain.Entities;

/// <summary>
/// Category for organizing tasks (e.g., Bug, Feature, Task).
/// Supports hierarchical structure.
/// </summary>
public class TaskCategory : BaseEntity, ISoftDelete, IAuditable
{
    /// <summary>
    /// Name of the category.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Optional description of the category.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Color for UI display (hex format, e.g., "#FF5733").
    /// </summary>
    public string? Color { get; set; }

    /// <summary>
    /// Icon name for UI display (e.g., "BugReport", "NewReleases").
    /// </summary>
    public string? Icon { get; set; }

    /// <summary>
    /// Display order for sorting.
    /// </summary>
    public int SortOrder { get; set; }

    /// <summary>
    /// Parent category ID for hierarchical structure.
    /// </summary>
    public Guid? ParentId { get; set; }

    /// <summary>
    /// Navigation property to parent category.
    /// </summary>
    public TaskCategory? Parent { get; set; }

    /// <summary>
    /// Navigation property to child categories.
    /// </summary>
    public ICollection<TaskCategory> Children { get; set; } = new List<TaskCategory>();

    /// <summary>
    /// Navigation property to tasks in this category.
    /// </summary>
    public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();

    // ISoftDelete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // IAuditable
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
