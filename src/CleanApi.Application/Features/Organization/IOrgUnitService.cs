using CleanApi.Application.Common.Models;
using CleanApi.Domain.Enums;

namespace CleanApi.Application.Features.Organization;

public interface IOrgUnitService
{
    Task<Result<IEnumerable<OrgUnitListDto>>> GetAllAsync(string? searchTerm = null, OrgUnitType? type = null, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<OrgUnitTreeNodeDto>>> GetTreeAsync(CancellationToken cancellationToken = default);
    Task<Result<OrgUnitDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<OrgAssignmentDto>>> GetMembersAsync(Guid orgUnitId, CancellationToken cancellationToken = default);
    Task<Result<OrgUnitDto>> CreateAsync(CreateOrgUnitDto dto, CancellationToken cancellationToken = default);
    Task<Result<OrgUnitDto>> UpdateAsync(Guid id, UpdateOrgUnitDto dto, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
