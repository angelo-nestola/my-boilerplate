using CleanApi.Domain.Common;
using CleanApi.Domain.Enums;

namespace CleanApi.Domain.Entities;

/// <summary>
/// Represents a user's membership in a project with their role.
/// </summary>
public class ProjectMember : BaseEntity
{
    /// <summary>
    /// The project ID.
    /// </summary>
    public Guid ProjectId { get; set; }

    /// <summary>
    /// Navigation property to the project.
    /// </summary>
    public Project Project { get; set; } = null!;

    /// <summary>
    /// The user ID (references ApplicationUser.Id).
    /// </summary>
    public required string UserId { get; set; }

    /// <summary>
    /// The user's role in this project.
    /// </summary>
    public ProjectRole Role { get; set; } = ProjectRole.Developer;

    /// <summary>
    /// Date when the user joined the project.
    /// </summary>
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Whether the member is active in the project.
    /// </summary>
    public bool IsActive { get; set; } = true;
}
