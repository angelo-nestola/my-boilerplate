using CleanApi.Application.Common.Models;

namespace CleanApi.Application.Features.Organization;

public interface ICapabilityService
{
    Task<Result<IEnumerable<CapabilityDto>>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<RoleCapabilityMatrixDto>>> GetRoleCapabilityMatrixAsync(CancellationToken cancellationToken = default);
    Task<Result> UpdateRoleCapabilitiesAsync(Guid roleId, IEnumerable<Guid> capabilityIds, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<string>>> GetUserCapabilitiesAsync(string userId, CancellationToken cancellationToken = default);
}
