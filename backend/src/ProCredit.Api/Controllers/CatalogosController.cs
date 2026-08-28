using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProCredit.Application.Dtos;
using ProCredit.Application.Services;

namespace ProCredit.Api.Controllers;

[ApiController]
[Authorize]
public sealed class CatalogosController(ICatalogoService catalogoService) : ControllerBase
{
    [HttpGet("api/departamentos")]
    [ProducesResponseType(typeof(IReadOnlyList<CatalogoDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CatalogoDto>>> Departamentos(CancellationToken cancellationToken) =>
        Ok(await catalogoService.ObtenerDepartamentosAsync(cancellationToken));

    [HttpGet("api/cargos")]
    [ProducesResponseType(typeof(IReadOnlyList<CatalogoDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CatalogoDto>>> Cargos(CancellationToken cancellationToken) =>
        Ok(await catalogoService.ObtenerCargosAsync(cancellationToken));
}
