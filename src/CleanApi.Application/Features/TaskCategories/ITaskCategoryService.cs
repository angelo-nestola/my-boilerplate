using CleanApi.Application.Common.Models;

namespace CleanApi.Application.Features.TaskCategories;

/// <summary>
/// Service for managing task categories.
/// </summary>
public interface ITaskCategoryService
{
    /// <summary>
    /// Gets all task categories as a flat list.
    /// </summary>
    Task<Result<IEnumerable<TaskCategoryDto>>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all task categories as a tree structure.
    /// </summary>
    Task<Result<IEnumerable<TaskCategoryTreeDto>>> GetTreeAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a task category by ID.
    /// </summary>
    Task<Result<TaskCategoryDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new task category.
    /// </summary>
    Task<Result<TaskCategoryDto>> CreateAsync(CreateTaskCategoryDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing task category.
    /// </summary>
    Task<Result<TaskCategoryDto>> UpdateAsync(Guid id, UpdateTaskCategoryDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a task category.
    /// </summary>
    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
