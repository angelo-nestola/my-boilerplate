using CleanApi.Application.Features.Organization;
using CleanApi.Infrastructure.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanApi.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/org-roles")]
public class OrgRolesController : ControllerBase
{
    private readonly ICapabilityService _capabilityService;

    public OrgRolesController(ICapabilityService capabilityService)
    {
        _capabilityService = capabilityService;
    }

    [HttpGet]
    [RequireCapability("MISSION_VIEW")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _capabilityService.GetRoleCapabilityMatrixAsync(cancellationToken);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}/capabilities")]
    [RequireCapability("ROLE_MANAGE")]
    public async Task<IActionResult> GetCapabilities(Guid id, CancellationToken cancellationToken)
    {
        var result = await _capabilityService.GetRoleCapabilityMatrixAsync(cancellationToken);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors) });

        var role = result.Value?.FirstOrDefault(r => r.RoleId == id);
        if (role == null)
            return NotFound(new { error = "OrgRole not found" });

        return Ok(role);
    }

    [HttpPut("{id:guid}/capabilities")]
    [RequireCapability("ROLE_MANAGE")]
    public async Task<IActionResult> UpdateCapabilities(Guid id, [FromBody] UpdateRoleCapabilitiesRequest request, CancellationToken cancellationToken)
    {
        var result = await _capabilityService.UpdateRoleCapabilitiesAsync(id, request.CapabilityIds, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        return NoContent();
    }
}

public record UpdateRoleCapabilitiesRequest(IEnumerable<Guid> CapabilityIds);
