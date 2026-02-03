using CleanApi.Application.Features.Tasks;
using CleanApi.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanApi.WebApi.Controllers;

/// <summary>
/// API for managing project tasks.
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    /// <summary>
    /// Gets all tasks with optional filtering.
    /// </summary>
    /// <param name="projectId">Filter by project ID.</param>
    /// <param name="assigneeId">Filter by assignee ID.</param>
    /// <param name="status">Filter by status.</param>
    /// <param name="priority">Filter by priority.</param>
    /// <param name="search">Search in title and description.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of tasks.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TaskListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? projectId,
        [FromQuery] string? assigneeId,
        [FromQuery] ProjectTaskStatus? status,
        [FromQuery] TaskPriority? priority,
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var result = await _taskService.GetAllAsync(projectId, assigneeId, status, priority, search, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Gets tasks assigned to the current user.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of tasks.</returns>
    [HttpGet("my")]
    [ProducesResponseType(typeof(IEnumerable<TaskListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyTasks(CancellationToken cancellationToken)
    {
        var result = await _taskService.GetMyTasksAsync(cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a task by ID.
    /// </summary>
    /// <param name="id">Task ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Task details.</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _taskService.GetByIdAsync(id, cancellationToken);
        if (!result.Succeeded)
        {
            return NotFound(new { error = string.Join(", ", result.Errors) });
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Creates a new task.
    /// </summary>
    /// <param name="dto">Task creation data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Created task.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateTaskDto dto, CancellationToken cancellationToken)
    {
        var result = await _taskService.CreateAsync(dto, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        }
        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    /// <summary>
    /// Updates an existing task.
    /// </summary>
    /// <param name="id">Task ID.</param>
    /// <param name="dto">Task update data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated task.</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskDto dto, CancellationToken cancellationToken)
    {
        var result = await _taskService.UpdateAsync(id, dto, cancellationToken);
        if (!result.Succeeded)
        {
            var error = string.Join(", ", result.Errors);
            if (error.Contains("not found"))
            {
                return NotFound(new { error });
            }
            return BadRequest(new { error });
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Deletes a task.
    /// </summary>
    /// <param name="id">Task ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _taskService.DeleteAsync(id, cancellationToken);
        if (!result.Succeeded)
        {
            return NotFound(new { error = string.Join(", ", result.Errors) });
        }
        return NoContent();
    }

    /// <summary>
    /// Updates task status.
    /// </summary>
    /// <param name="id">Task ID.</param>
    /// <param name="status">New status.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated task.</returns>
    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] ProjectTaskStatus status, CancellationToken cancellationToken)
    {
        var result = await _taskService.UpdateStatusAsync(id, status, cancellationToken);
        if (!result.Succeeded)
        {
            return NotFound(new { error = string.Join(", ", result.Errors) });
        }
        return Ok(result.Value);
    }
}
