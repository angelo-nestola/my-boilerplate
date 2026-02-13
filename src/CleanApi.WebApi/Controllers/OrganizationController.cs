using CleanApi.Application.Features.Organization;
using CleanApi.Infrastructure.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanApi.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/organization")]
public class OrganizationController : ControllerBase
{
    private readonly IOrganizationDashboardService _dashboardService;

    public OrganizationController(IOrganizationDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("dashboard")]
    [RequireCapability("MISSION_VIEW")]
    public async Task<IActionResult> GetDashboard(CancellationToken cancellationToken)
    {
        var result = await _dashboardService.GetDashboardAsync(cancellationToken);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        return Ok(result.Value);
    }

    [HttpGet("sanity-check")]
    [RequireCapability("ORGUNIT_MANAGE")]
    public async Task<IActionResult> RunSanityCheck(CancellationToken cancellationToken)
    {
        var result = await _dashboardService.RunSanityCheckAsync(cancellationToken);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        return Ok(result.Value);
    }
}
