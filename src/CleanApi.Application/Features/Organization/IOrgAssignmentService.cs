using CleanApi.Application.Common.Models;

namespace CleanApi.Application.Features.Organization;

public interface IOrgAssignmentService
{
    Task<Result<OrgAssignmentDto>> CreateAsync(CreateOrgAssignmentDto dto, CancellationToken cancellationToken = default);
    Task<Result<OrgAssignmentDto>> UpdateAsync(Guid id, UpdateOrgAssignmentDto dto, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<OrgAssignmentDto>>> GetByPersonAsync(Guid personId, CancellationToken cancellationToken = default);
}
