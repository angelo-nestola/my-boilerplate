using CleanApi.Domain.Common;

namespace CleanApi.Domain.Entities;

public class OrgRole : BaseEntity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public bool IsSystem { get; set; } = true;

    // Navigation
    public ICollection<RoleCapability> RoleCapabilities { get; set; } = [];
    public ICollection<OrgAssignment> Assignments { get; set; } = [];
}
