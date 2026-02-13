using CleanApi.Domain.Common;
using CleanApi.Domain.Enums;

namespace CleanApi.Domain.Entities;

public class Person : BaseEntity, ISoftDelete, IAuditable
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public PersonStatus Status { get; set; } = PersonStatus.Active;
    public string? Notes { get; set; }
    public string? UserId { get; set; }

    // ISoftDelete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // IAuditable
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }

    // Navigation
    public ICollection<OrgAssignment> OrgAssignments { get; set; } = [];
}
