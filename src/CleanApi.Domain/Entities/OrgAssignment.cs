using CleanApi.Domain.Common;

namespace CleanApi.Domain.Entities;

public class OrgAssignment : BaseEntity, IAuditable
{
    public Guid PersonId { get; set; }
    public Guid OrgUnitId { get; set; }
    public Guid OrgRoleId { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }

    // IAuditable
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }

    // Navigation
    public Person Person { get; set; } = null!;
    public OrgUnit OrgUnit { get; set; } = null!;
    public OrgRole OrgRole { get; set; } = null!;
}
