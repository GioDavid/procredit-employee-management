using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProCredit.Application.Dtos;
using ProCredit.Application.Services;

namespace ProCredit.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/employees")]
public sealed class EmployeesController(IEmployeeService employeeService) : ControllerBase
{
    /// <summary>Lists all employees or filters by a partial department name match.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<EmployeeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<EmployeeDto>>> GetEmployees(
        [FromQuery] string? department,
        CancellationToken cancellationToken) =>
        Ok(await employeeService.GetEmployeesAsync(department, cancellationToken));

    [HttpGet("{employeeId:int}")]
    [ProducesResponseType(typeof(EmployeeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EmployeeDto>> GetById(int employeeId, CancellationToken cancellationToken)
    {
        var employees = await employeeService.GetEmployeesAsync(null, cancellationToken);
        var employee = employees.FirstOrDefault(e => e.EmployeeId == employeeId);
        return employee is null ? NotFound() : Ok(employee);
    }

    [HttpPost]
    [ProducesResponseType(typeof(EmployeeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<EmployeeDto>> Create(
        [FromBody] CreateEmployeeRequest request,
        CancellationToken cancellationToken)
    {
        var employee = await employeeService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { employeeId = employee.EmployeeId }, employee);
    }
}
