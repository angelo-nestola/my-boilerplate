using CleanApi.Application.Features.Organization;
using CleanApi.Infrastructure.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanApi.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/persons")]
public class PersonsController : ControllerBase
{
    private readonly IPersonService _personService;
    private readonly IOrgAssignmentService _assignmentService;

    public PersonsController(IPersonService personService, IOrgAssignmentService assignmentService)
    {
        _personService = personService;
        _assignmentService = assignmentService;
    }

    [HttpGet]
    [RequireCapability("MISSION_VIEW")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        CancellationToken cancellationToken)
    {
        var result = await _personService.GetAllAsync(search, isActive, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    [RequireCapability("MISSION_VIEW")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _personService.GetByIdAsync(id, cancellationToken);
        if (!result.Succeeded)
            return NotFound(new { error = string.Join(", ", result.Errors) });
        return Ok(result.Value);
    }

    [HttpPost]
    [RequireCapability("PERSON_MANAGE")]
    public async Task<IActionResult> Create([FromBody] CreatePersonDto dto, CancellationToken cancellationToken)
    {
        var result = await _personService.CreateAsync(dto, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    [RequireCapability("PERSON_MANAGE")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePersonDto dto, CancellationToken cancellationToken)
    {
        var result = await _personService.UpdateAsync(id, dto, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    [RequireCapability("PERSON_MANAGE")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _personService.DeleteAsync(id, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        return NoContent();
    }

    // Nested assignments
    [HttpGet("{personId:guid}/assignments")]
    [RequireCapability("MISSION_VIEW")]
    public async Task<IActionResult> GetAssignments(Guid personId, CancellationToken cancellationToken)
    {
        var result = await _assignmentService.GetByPersonAsync(personId, cancellationToken);
        if (!result.Succeeded)
            return NotFound(new { error = string.Join(", ", result.Errors) });
        return Ok(result.Value);
    }

    [HttpPost("{personId:guid}/assignments")]
    [RequireCapability("PERSON_MANAGE")]
    public async Task<IActionResult> CreateAssignment(Guid personId, [FromBody] CreateOrgAssignmentDto dto, CancellationToken cancellationToken)
    {
        if (dto.PersonId != personId)
            return BadRequest(new { error = "PersonId in URL and body must match" });

        var result = await _assignmentService.CreateAsync(dto, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        return Created($"api/persons/{personId}/assignments/{result.Value!.Id}", result.Value);
    }

    [HttpPut("{personId:guid}/assignments/{id:guid}")]
    [RequireCapability("PERSON_MANAGE")]
    public async Task<IActionResult> UpdateAssignment(Guid personId, Guid id, [FromBody] UpdateOrgAssignmentDto dto, CancellationToken cancellationToken)
    {
        var result = await _assignmentService.UpdateAsync(id, dto, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        return Ok(result.Value);
    }

    [HttpDelete("{personId:guid}/assignments/{id:guid}")]
    [RequireCapability("PERSON_MANAGE")]
    public async Task<IActionResult> DeleteAssignment(Guid personId, Guid id, CancellationToken cancellationToken)
    {
        var result = await _assignmentService.DeleteAsync(id, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors) });
        return NoContent();
    }
}
