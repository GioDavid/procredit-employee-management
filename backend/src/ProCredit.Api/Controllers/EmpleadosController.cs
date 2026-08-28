using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProCredit.Application.Dtos;
using ProCredit.Application.Services;

namespace ProCredit.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/empleados")]
public sealed class EmpleadosController(IEmpleadoService empleadoService) : ControllerBase
{
    /// <summary>Lista todos los empleados o filtra por coincidencia parcial del departamento.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<EmpleadoDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<EmpleadoDto>>> Consultar(
        [FromQuery] string? departamento,
        CancellationToken cancellationToken) =>
        Ok(await empleadoService.ConsultarAsync(departamento, cancellationToken));

    [HttpGet("{empleadoId:int}")]
    [ProducesResponseType(typeof(EmpleadoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EmpleadoDto>> ObtenerPorId(int empleadoId, CancellationToken cancellationToken)
    {
        var empleados = await empleadoService.ConsultarAsync(null, cancellationToken);
        var empleado = empleados.FirstOrDefault(e => e.EmpleadoId == empleadoId);
        return empleado is null ? NotFound() : Ok(empleado);
    }

    [HttpPost]
    [ProducesResponseType(typeof(EmpleadoDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<EmpleadoDto>> Agregar(
        [FromBody] CrearEmpleadoRequest request,
        CancellationToken cancellationToken)
    {
        var empleado = await empleadoService.AgregarAsync(request, cancellationToken);
        return CreatedAtAction(nameof(ObtenerPorId), new { empleadoId = empleado.EmpleadoId }, empleado);
    }
}
