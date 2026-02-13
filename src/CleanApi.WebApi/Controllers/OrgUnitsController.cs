using CleanApi.Application.Features.Organization;
using CleanApi.Domain.Enums;
using CleanApi.Infrastructure.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanApi.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/org-units")]
public class OrgUnitsController : ControllerBase
{
    private readonly IOrgUnitService _orgUnitService;

    public OrgUnitsController(IOrgUnitService orgUnitService)
    {
        _orgUnitService = orgUnitService;
    }

    [HttpGet]
    [RequireCapability("MISSION_VIEW")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] OrgUnitType? type,
        CancellationToken cancellationToken)
    {
        var result = await _orgUnitService.GetAllAsync(search, type, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        return Ok(result.Value);
    }

    [HttpGet("tree")]
    [RequireCapability("MISSION_VIEW")]
    public async Task<IActionResult> GetTree(CancellationToken cancellationToken)
    {
        var result = await _orgUnitService.GetTreeAsync(cancellationToken);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    [RequireCapability("MISSION_VIEW")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _orgUnitService.GetByIdAsync(id, cancellationToken);
        if (!result.Succeeded)
            return NotFound(new { error = string.Join(", ", result.Errors) });
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}/members")]
    [RequireCapability("MISSION_VIEW")]
    public async Task<IActionResult> GetMembers(Guid id, CancellationToken cancellationToken)
    {
        var result = await _orgUnitService.GetMembersAsync(id, cancellationToken);
        if (!result.Succeeded)
            return NotFound(new { error = string.Join(", ", result.Errors) });
        return Ok(result.Value);
    }

    [HttpPost]
    [RequireCapability("ORGUNIT_MANAGE")]
    public async Task<IActionResult> Create([FromBody] CreateOrgUnitDto dto, CancellationToken cancellationToken)
    {
        var result = await _orgUnitService.CreateAsync(dto, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    [RequireCapability("ORGUNIT_MANAGE")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOrgUnitDto dto, CancellationToken cancellationToken)
    {
        var result = await _orgUnitService.UpdateAsync(id, dto, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    [RequireCapability("ORGUNIT_MANAGE")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _orgUnitService.DeleteAsync(id, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        return NoContent();
    }
}
