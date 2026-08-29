using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProCredit.Application.Dtos;
using ProCredit.Application.Services;

namespace ProCredit.Api.Controllers;

[ApiController]
[Authorize]
public sealed class CatalogsController(ICatalogService catalogService) : ControllerBase
{
    [HttpGet("api/departments")]
    [ProducesResponseType(typeof(IReadOnlyList<CatalogDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CatalogDto>>> Departments(CancellationToken cancellationToken) =>
        Ok(await catalogService.GetDepartmentsAsync(cancellationToken));

    [HttpGet("api/positions")]
    [ProducesResponseType(typeof(IReadOnlyList<CatalogDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CatalogDto>>> Positions(CancellationToken cancellationToken) =>
        Ok(await catalogService.GetPositionsAsync(cancellationToken));
}
