using CleanApi.Domain.Common;
using CleanApi.Domain.Enums;

namespace CleanApi.Domain.Entities;

public class OrgUnit : BaseEntity, ISoftDelete, IAuditable
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public OrgUnitType Type { get; set; }
    public string? Description { get; set; }
    public string? Domain { get; set; }
    public OrgUnitStatus Status { get; set; } = OrgUnitStatus.Active;

    // Hierarchy
    public Guid? ParentId { get; set; }

    // ISoftDelete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // IAuditable
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }

    // Navigation
    public OrgUnit? Parent { get; set; }
    public ICollection<OrgUnit> Children { get; set; } = [];
    public ICollection<OrgAssignment> Assignments { get; set; } = [];
}
