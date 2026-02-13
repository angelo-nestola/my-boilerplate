using Microsoft.AspNetCore.Authorization;

namespace CleanApi.Infrastructure.Authorization;

public class RequireCapabilityAttribute : AuthorizeAttribute
{
    public const string PolicyPrefix = "Capability_";

    public RequireCapabilityAttribute(string capabilityCode)
        : base($"{PolicyPrefix}{capabilityCode}")
    {
        CapabilityCode = capabilityCode;
    }

    public string CapabilityCode { get; }
}
