using CleanApi.Domain.Common;

namespace CleanApi.Domain.Entities;

public class Capability : BaseEntity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required string Group { get; set; }
    public bool IsSystem { get; set; } = true;

    // Navigation
    public ICollection<RoleCapability> RoleCapabilities { get; set; } = [];
}
