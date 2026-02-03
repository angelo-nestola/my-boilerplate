using CleanApi.Application.Common.Models;
using CleanApi.Domain.Enums;

namespace CleanApi.Application.Features.Tasks;

/// <summary>
/// Service for managing project tasks.
/// </summary>
public interface ITaskService
{
    /// <summary>
    /// Gets all tasks with optional filtering.
    /// </summary>
    Task<Result<IEnumerable<TaskListDto>>> GetAllAsync(
        Guid? projectId = null,
        string? assigneeId = null,
        ProjectTaskStatus? status = null,
        TaskPriority? priority = null,
        string? searchTerm = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets tasks assigned to the current user.
    /// </summary>
    Task<Result<IEnumerable<TaskListDto>>> GetMyTasksAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a task by ID.
    /// </summary>
    Task<Result<TaskDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new task.
    /// </summary>
    Task<Result<TaskDto>> CreateAsync(CreateTaskDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing task.
    /// </summary>
    Task<Result<TaskDto>> UpdateAsync(Guid id, UpdateTaskDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a task.
    /// </summary>
    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates task status.
    /// </summary>
    Task<Result<TaskDto>> UpdateStatusAsync(Guid id, ProjectTaskStatus status, CancellationToken cancellationToken = default);
}
