using CleanApi.Domain.Enums;

namespace CleanApi.Application.Features.Projects;

/// <summary>
/// DTO representing a project.
/// </summary>
public record ProjectDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Code { get; init; }
    public string? Description { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public int MemberCount { get; init; }
    public int TaskCount { get; init; }
}

/// <summary>
/// DTO for project list with summary info.
/// </summary>
public record ProjectListDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Code { get; init; }
    public string? Description { get; init; }
    public bool IsActive { get; init; }
    public int MemberCount { get; init; }
    public int TaskCount { get; init; }
    public int CompletedTaskCount { get; init; }
}

/// <summary>
/// DTO for creating a new project.
/// </summary>
public record CreateProjectDto
{
    public required string Name { get; init; }
    public required string Code { get; init; }
    public string? Description { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
}

/// <summary>
/// DTO for updating a project.
/// </summary>
public record UpdateProjectDto
{
    public string? Name { get; init; }
    public string? Description { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public bool? IsActive { get; init; }
}

/// <summary>
/// DTO representing a project member.
/// </summary>
public record ProjectMemberDto
{
    public required Guid Id { get; init; }
    public required string UserId { get; init; }
    public required string UserEmail { get; init; }
    public string? UserFullName { get; init; }
    public required ProjectRole Role { get; init; }
    public DateTime JoinedAt { get; init; }
}

/// <summary>
/// DTO for adding a member to a project.
/// </summary>
public record AddProjectMemberDto
{
    public required string UserId { get; init; }
    public ProjectRole Role { get; init; } = ProjectRole.Developer;
}

/// <summary>
/// DTO for updating a member's role.
/// </summary>
public record UpdateProjectMemberDto
{
    public required ProjectRole Role { get; init; }
}
