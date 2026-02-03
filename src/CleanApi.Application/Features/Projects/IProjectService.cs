using CleanApi.Application.Common.Models;

namespace CleanApi.Application.Features.Projects;

/// <summary>
/// Service for managing projects.
/// </summary>
public interface IProjectService
{
    /// <summary>
    /// Gets all projects with optional filtering.
    /// </summary>
    Task<Result<IEnumerable<ProjectListDto>>> GetAllAsync(string? searchTerm = null, bool? isActive = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a project by ID.
    /// </summary>
    Task<Result<ProjectDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a project by code.
    /// </summary>
    Task<Result<ProjectDto>> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new project.
    /// </summary>
    Task<Result<ProjectDto>> CreateAsync(CreateProjectDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing project.
    /// </summary>
    Task<Result<ProjectDto>> UpdateAsync(Guid id, UpdateProjectDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a project.
    /// </summary>
    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all members of a project.
    /// </summary>
    Task<Result<IEnumerable<ProjectMemberDto>>> GetMembersAsync(Guid projectId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a member to a project.
    /// </summary>
    Task<Result<ProjectMemberDto>> AddMemberAsync(Guid projectId, AddProjectMemberDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates a member's role.
    /// </summary>
    Task<Result<ProjectMemberDto>> UpdateMemberAsync(Guid projectId, Guid memberId, UpdateProjectMemberDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Removes a member from a project.
    /// </summary>
    Task<Result> RemoveMemberAsync(Guid projectId, Guid memberId, CancellationToken cancellationToken = default);
}
