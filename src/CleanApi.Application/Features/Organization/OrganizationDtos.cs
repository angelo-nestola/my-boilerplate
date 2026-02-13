using CleanApi.Domain.Enums;

namespace CleanApi.Application.Features.Organization;

// === OrgUnit DTOs ===

public record OrgUnitDto
{
    public required Guid Id { get; init; }
    public required string Code { get; init; }
    public required string Name { get; init; }
    public OrgUnitType Type { get; init; }
    public string? Description { get; init; }
    public string? Domain { get; init; }
    public OrgUnitStatus Status { get; init; }
    public Guid? ParentId { get; init; }
    public string? ParentName { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public int MemberCount { get; init; }
    public int ChildCount { get; init; }
}

public record OrgUnitListDto
{
    public required Guid Id { get; init; }
    public required string Code { get; init; }
    public required string Name { get; init; }
    public OrgUnitType Type { get; init; }
    public string? Domain { get; init; }
    public OrgUnitStatus Status { get; init; }
    public Guid? ParentId { get; init; }
    public string? ParentName { get; init; }
    public int MemberCount { get; init; }
}

public record CreateOrgUnitDto
{
    public required string Code { get; init; }
    public required string Name { get; init; }
    public OrgUnitType Type { get; init; }
    public string? Description { get; init; }
    public string? Domain { get; init; }
    public Guid? ParentId { get; init; }
}

public record UpdateOrgUnitDto
{
    public string? Name { get; init; }
    public string? Description { get; init; }
    public string? Domain { get; init; }
    public OrgUnitStatus? Status { get; init; }
    public Guid? ParentId { get; init; }
}

// === Person DTOs ===

public record PersonDto
{
    public required Guid Id { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public required string Email { get; init; }
    public PersonStatus Status { get; init; }
    public string? Notes { get; init; }
    public string? UserId { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public int AssignmentCount { get; init; }
}

public record PersonListDto
{
    public required Guid Id { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public required string Email { get; init; }
    public PersonStatus Status { get; init; }
    public int AssignmentCount { get; init; }
}

public record PersonDetailDto
{
    public required Guid Id { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public required string Email { get; init; }
    public PersonStatus Status { get; init; }
    public string? Notes { get; init; }
    public string? UserId { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public IReadOnlyList<OrgAssignmentDto> Assignments { get; init; } = [];
}

public record CreatePersonDto
{
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public required string Email { get; init; }
    public string? Notes { get; init; }
    public string? UserId { get; init; }
}

public record UpdatePersonDto
{
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? Email { get; init; }
    public string? Notes { get; init; }
    public PersonStatus? Status { get; init; }
    public string? UserId { get; init; }
}

// === OrgAssignment DTOs ===

public record OrgAssignmentDto
{
    public required Guid Id { get; init; }
    public Guid PersonId { get; init; }
    public Guid OrgUnitId { get; init; }
    public Guid OrgRoleId { get; init; }
    public DateTime ValidFrom { get; init; }
    public DateTime? ValidTo { get; init; }
    public string PersonName { get; init; } = "";
    public string OrgUnitName { get; init; } = "";
    public string RoleName { get; init; } = "";
}

public record CreateOrgAssignmentDto
{
    public Guid PersonId { get; init; }
    public Guid OrgUnitId { get; init; }
    public Guid OrgRoleId { get; init; }
    public DateTime ValidFrom { get; init; }
    public DateTime? ValidTo { get; init; }
}

public record UpdateOrgAssignmentDto
{
    public Guid? OrgRoleId { get; init; }
    public DateTime? ValidFrom { get; init; }
    public DateTime? ValidTo { get; init; }
}

// === OrgRole & Capability DTOs ===

public record OrgRoleDto
{
    public required Guid Id { get; init; }
    public required string Code { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public bool IsSystem { get; init; }
}

public record CapabilityDto
{
    public required Guid Id { get; init; }
    public required string Code { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public required string Group { get; init; }
}

public record RoleCapabilityMatrixDto
{
    public required Guid RoleId { get; init; }
    public required string RoleCode { get; init; }
    public required string RoleName { get; init; }
    public IReadOnlyList<string> CapabilityCodes { get; init; } = [];
}

// === Tree DTOs ===

public record OrgUnitTreeNodeDto
{
    public required Guid Id { get; init; }
    public required string Code { get; init; }
    public required string Name { get; init; }
    public OrgUnitType Type { get; init; }
    public OrgUnitStatus Status { get; init; }
    public string? Domain { get; init; }
    public int MemberCount { get; init; }
    public IReadOnlyList<OrgUnitTreeNodeDto> Children { get; init; } = [];
}

// === Dashboard DTOs ===

public record OrgDashboardDto
{
    public int OrbitCount { get; init; }
    public int CcCount { get; init; }
    public int StaffGroupCount { get; init; }
    public int TechHubCount { get; init; }
    public int ActivePersonCount { get; init; }
    public IReadOnlyList<SanityCheckResultDto> SanityChecks { get; init; } = [];
}

public record SanityCheckResultDto
{
    public required string Code { get; init; }
    public required string Description { get; init; }
    public bool Passed { get; init; }
}
