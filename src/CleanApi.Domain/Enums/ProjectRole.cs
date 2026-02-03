namespace CleanApi.Domain.Enums;

/// <summary>
/// Role of a user within a project.
/// </summary>
public enum ProjectRole
{
    /// <summary>
    /// Read-only access to the project.
    /// </summary>
    Viewer = 0,

    /// <summary>
    /// Can create and edit tasks.
    /// </summary>
    Developer = 1,

    /// <summary>
    /// Can manage project settings and members.
    /// </summary>
    Admin = 2,

    /// <summary>
    /// Full control over the project.
    /// </summary>
    Owner = 3
}
