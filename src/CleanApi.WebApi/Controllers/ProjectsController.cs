using CleanApi.Application.Features.Projects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanApi.WebApi.Controllers;

/// <summary>
/// API for managing projects.
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    /// <summary>
    /// Gets all projects with optional filtering.
    /// </summary>
    /// <param name="search">Optional search term.</param>
    /// <param name="isActive">Optional active status filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of projects.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ProjectListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        CancellationToken cancellationToken)
    {
        var result = await _projectService.GetAllAsync(search, isActive, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a project by ID.
    /// </summary>
    /// <param name="id">Project ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Project details.</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _projectService.GetByIdAsync(id, cancellationToken);
        if (!result.Succeeded)
        {
            return NotFound(new { error = string.Join(", ", result.Errors) });
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a project by code.
    /// </summary>
    /// <param name="code">Project code.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Project details.</returns>
    [HttpGet("code/{code}")]
    [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByCode(string code, CancellationToken cancellationToken)
    {
        var result = await _projectService.GetByCodeAsync(code, cancellationToken);
        if (!result.Succeeded)
        {
            return NotFound(new { error = string.Join(", ", result.Errors) });
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Creates a new project.
    /// </summary>
    /// <param name="dto">Project creation data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Created project.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateProjectDto dto, CancellationToken cancellationToken)
    {
        var result = await _projectService.CreateAsync(dto, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        }
        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    /// <summary>
    /// Updates an existing project.
    /// </summary>
    /// <param name="id">Project ID.</param>
    /// <param name="dto">Project update data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated project.</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectDto dto, CancellationToken cancellationToken)
    {
        var result = await _projectService.UpdateAsync(id, dto, cancellationToken);
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
    /// Deletes a project.
    /// </summary>
    /// <param name="id">Project ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _projectService.DeleteAsync(id, cancellationToken);
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

    // === Members ===

    /// <summary>
    /// Gets all members of a project.
    /// </summary>
    /// <param name="id">Project ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of members.</returns>
    [HttpGet("{id:guid}/members")]
    [ProducesResponseType(typeof(IEnumerable<ProjectMemberDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMembers(Guid id, CancellationToken cancellationToken)
    {
        var result = await _projectService.GetMembersAsync(id, cancellationToken);
        if (!result.Succeeded)
        {
            return NotFound(new { error = string.Join(", ", result.Errors) });
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Adds a member to a project.
    /// </summary>
    /// <param name="id">Project ID.</param>
    /// <param name="dto">Member data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Added member.</returns>
    [HttpPost("{id:guid}/members")]
    [ProducesResponseType(typeof(ProjectMemberDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddMember(Guid id, [FromBody] AddProjectMemberDto dto, CancellationToken cancellationToken)
    {
        var result = await _projectService.AddMemberAsync(id, dto, cancellationToken);
        if (!result.Succeeded)
        {
            var error = string.Join(", ", result.Errors);
            if (error.Contains("not found"))
            {
                return NotFound(new { error });
            }
            return BadRequest(new { error });
        }
        return CreatedAtAction(nameof(GetMembers), new { id }, result.Value);
    }

    /// <summary>
    /// Updates a member's role.
    /// </summary>
    /// <param name="id">Project ID.</param>
    /// <param name="memberId">Member ID.</param>
    /// <param name="dto">Role update data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated member.</returns>
    [HttpPut("{id:guid}/members/{memberId:guid}")]
    [ProducesResponseType(typeof(ProjectMemberDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMember(Guid id, Guid memberId, [FromBody] UpdateProjectMemberDto dto, CancellationToken cancellationToken)
    {
        var result = await _projectService.UpdateMemberAsync(id, memberId, dto, cancellationToken);
        if (!result.Succeeded)
        {
            return NotFound(new { error = string.Join(", ", result.Errors) });
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Removes a member from a project.
    /// </summary>
    /// <param name="id">Project ID.</param>
    /// <param name="memberId">Member ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("{id:guid}/members/{memberId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RemoveMember(Guid id, Guid memberId, CancellationToken cancellationToken)
    {
        var result = await _projectService.RemoveMemberAsync(id, memberId, cancellationToken);
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
