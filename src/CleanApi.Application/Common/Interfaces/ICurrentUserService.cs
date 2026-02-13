namespace CleanApi.Application.Common.Interfaces;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
    Guid? PersonId { get; }
    IReadOnlyList<string> Capabilities { get; }
    Task<bool> HasCapabilityAsync(string capabilityCode);
}
