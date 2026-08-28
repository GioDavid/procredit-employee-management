using ProCredit.Application.Abstractions;
using ProCredit.Application.Dtos;

namespace ProCredit.Application.Services;

public sealed class CatalogoService(ICatalogoRepository catalogoRepository) : ICatalogoService
{
    public async Task<IReadOnlyList<CatalogoDto>> ObtenerDepartamentosAsync(CancellationToken cancellationToken)
    {
        var departamentos = await catalogoRepository.ObtenerDepartamentosAsync(cancellationToken);
        return departamentos.Select(d => new CatalogoDto(d.DepartamentoId, d.Nombre)).ToList();
    }

    public async Task<IReadOnlyList<CatalogoDto>> ObtenerCargosAsync(CancellationToken cancellationToken)
    {
        var cargos = await catalogoRepository.ObtenerCargosAsync(cancellationToken);
        return cargos.Select(c => new CatalogoDto(c.CargoId, c.Nombre)).ToList();
    }
}
