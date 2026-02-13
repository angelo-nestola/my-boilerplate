using CleanApi.Domain.Common;

namespace CleanApi.Domain.Entities;

public class RoleCapability : BaseEntity
{
    public Guid OrgRoleId { get; set; }
    public Guid CapabilityId { get; set; }

    // Navigation
    public OrgRole OrgRole { get; set; } = null!;
    public Capability Capability { get; set; } = null!;
}
