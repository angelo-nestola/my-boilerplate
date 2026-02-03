using CleanApi.Domain.Enums;

namespace CleanApi.Application.Features.Tasks;

/// <summary>
/// DTO representing a project task.
/// </summary>
public record TaskDto
{
    public required Guid Id { get; init; }
    public required Guid ProjectId { get; init; }
    public string? ProjectName { get; init; }
    public string? ProjectCode { get; init; }
    public required int TaskNumber { get; init; }
    public required string Title { get; init; }
    public string? Description { get; init; }
    public required ProjectTaskStatus Status { get; init; }
    public required TaskPriority Priority { get; init; }
    public Guid? CategoryId { get; init; }
    public string? CategoryName { get; init; }
    public string? AssigneeId { get; init; }
    public string? AssigneeName { get; init; }
    public string? AssigneeEmail { get; init; }
    public decimal? EstimatedHours { get; init; }
    public decimal? ActualHours { get; init; }
    public DateTime? DueDate { get; init; }
    public DateTime? CompletedAt { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    /// <summary>
    /// Full task key (e.g., "PROJ-123").
    /// </summary>
    public string TaskKey => $"{ProjectCode}-{TaskNumber}";
}

/// <summary>
/// DTO for task list with minimal info.
/// </summary>
public record TaskListDto
{
    public required Guid Id { get; init; }
    public required Guid ProjectId { get; init; }
    public string? ProjectCode { get; init; }
    public required int TaskNumber { get; init; }
    public required string Title { get; init; }
    public required ProjectTaskStatus Status { get; init; }
    public required TaskPriority Priority { get; init; }
    public string? CategoryName { get; init; }
    public string? AssigneeName { get; init; }
    public DateTime? DueDate { get; init; }

    public string TaskKey => $"{ProjectCode}-{TaskNumber}";
}

/// <summary>
/// DTO for creating a new task.
/// </summary>
public record CreateTaskDto
{
    public required Guid ProjectId { get; init; }
    public required string Title { get; init; }
    public string? Description { get; init; }
    public ProjectTaskStatus Status { get; init; } = ProjectTaskStatus.Backlog;
    public TaskPriority Priority { get; init; } = TaskPriority.Medium;
    public Guid? CategoryId { get; init; }
    public string? AssigneeId { get; init; }
    public decimal? EstimatedHours { get; init; }
    public DateTime? DueDate { get; init; }
}

/// <summary>
/// DTO for updating a task.
/// </summary>
public record UpdateTaskDto
{
    public string? Title { get; init; }
    public string? Description { get; init; }
    public ProjectTaskStatus? Status { get; init; }
    public TaskPriority? Priority { get; init; }
    public Guid? CategoryId { get; init; }
    public string? AssigneeId { get; init; }
    public decimal? EstimatedHours { get; init; }
    public decimal? ActualHours { get; init; }
    public DateTime? DueDate { get; init; }
}
