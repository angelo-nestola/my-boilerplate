using Microsoft.AspNetCore.Authorization;

namespace CleanApi.Infrastructure.Authorization;

public class CapabilityRequirement : IAuthorizationRequirement
{
    public string CapabilityCode { get; }

    public CapabilityRequirement(string capabilityCode)
    {
        CapabilityCode = capabilityCode;
    }
}
