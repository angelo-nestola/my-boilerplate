using CleanApi.Application.Features.TaskCategories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanApi.WebApi.Controllers;

/// <summary>
/// API for managing task categories.
/// </summary>
[Authorize]
[ApiController]
[Route("api/categories")]
public class TaskCategoriesController : ControllerBase
{
    private readonly ITaskCategoryService _categoryService;

    public TaskCategoriesController(ITaskCategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    /// <summary>
    /// Gets all task categories as a flat list.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of categories.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TaskCategoryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _categoryService.GetAllAsync(cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Gets all task categories as a tree structure.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Tree of categories.</returns>
    [HttpGet("tree")]
    [ProducesResponseType(typeof(IEnumerable<TaskCategoryTreeDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTree(CancellationToken cancellationToken)
    {
        var result = await _categoryService.GetTreeAsync(cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a task category by ID.
    /// </summary>
    /// <param name="id">Category ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Category details.</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TaskCategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _categoryService.GetByIdAsync(id, cancellationToken);
        if (!result.Succeeded)
        {
            return NotFound(new { error = string.Join(", ", result.Errors) });
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Creates a new task category.
    /// </summary>
    /// <param name="dto">Category creation data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Created category.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(TaskCategoryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateTaskCategoryDto dto, CancellationToken cancellationToken)
    {
        var result = await _categoryService.CreateAsync(dto, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        }
        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    /// <summary>
    /// Updates an existing task category.
    /// </summary>
    /// <param name="id">Category ID.</param>
    /// <param name="dto">Category update data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated category.</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TaskCategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskCategoryDto dto, CancellationToken cancellationToken)
    {
        var result = await _categoryService.UpdateAsync(id, dto, cancellationToken);
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
    /// Deletes a task category.
    /// </summary>
    /// <param name="id">Category ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _categoryService.DeleteAsync(id, cancellationToken);
        if (!result.Succeeded)
        {
            var error = string.Join(", ", result.Errors);
            if (error.Contains("not found"))
            {
                return NotFound(new { error });
            }
            return BadRequest(new { error });
        }
        return NoContent();
    }
}
