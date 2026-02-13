using CleanApi.Application.Common.Models;

namespace CleanApi.Application.Features.Organization;

public interface IPersonService
{
    Task<Result<IEnumerable<PersonListDto>>> GetAllAsync(string? searchTerm = null, bool? isActive = null, CancellationToken cancellationToken = default);
    Task<Result<PersonDetailDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<PersonDto>> CreateAsync(CreatePersonDto dto, CancellationToken cancellationToken = default);
    Task<Result<PersonDto>> UpdateAsync(Guid id, UpdatePersonDto dto, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
