namespace CleanApi.Domain.Enums;

/// <summary>
/// Priority level of a task.
/// </summary>
public enum TaskPriority
{
    /// <summary>
    /// Low priority, can be done when there's time.
    /// </summary>
    Low = 0,

    /// <summary>
    /// Normal priority, standard work item.
    /// </summary>
    Medium = 1,

    /// <summary>
    /// High priority, should be done soon.
    /// </summary>
    High = 2,

    /// <summary>
    /// Urgent, requires immediate attention.
    /// </summary>
    Urgent = 3
}
