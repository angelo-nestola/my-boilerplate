using CleanApi.Application.Common.Models;

namespace CleanApi.Application.Features.Organization;

public interface IOrganizationDashboardService
{
    Task<Result<OrgDashboardDto>> GetDashboardAsync(CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<SanityCheckResultDto>>> RunSanityCheckAsync(CancellationToken cancellationToken = default);
}
