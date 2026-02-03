namespace CleanApi.Domain.Enums;

/// <summary>
/// Status of a project task.
/// </summary>
public enum ProjectTaskStatus
{
    /// <summary>
    /// Task is in the backlog, not yet planned.
    /// </summary>
    Backlog = 0,

    /// <summary>
    /// Task is planned for work.
    /// </summary>
    Todo = 1,

    /// <summary>
    /// Task is currently being worked on.
    /// </summary>
    InProgress = 2,

    /// <summary>
    /// Task is in review.
    /// </summary>
    Review = 3,

    /// <summary>
    /// Task is completed.
    /// </summary>
    Done = 4,

    /// <summary>
    /// Task is closed (won't be done).
    /// </summary>
    Closed = 5
}
