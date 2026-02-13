using CleanApi.Application.Features.Organization;
using CleanApi.Infrastructure.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanApi.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/capabilities")]
public class CapabilitiesController : ControllerBase
{
    private readonly ICapabilityService _capabilityService;

    public CapabilitiesController(ICapabilityService capabilityService)
    {
        _capabilityService = capabilityService;
    }

    [HttpGet]
    [RequireCapability("ROLE_MANAGE")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _capabilityService.GetAllAsync(cancellationToken);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        return Ok(result.Value);
    }
}
