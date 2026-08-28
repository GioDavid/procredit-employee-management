using ProCredit.Application.Dtos;

namespace ProCredit.Application.Services;

public interface ICatalogoService
{
    Task<IReadOnlyList<CatalogoDto>> ObtenerDepartamentosAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<CatalogoDto>> ObtenerCargosAsync(CancellationToken cancellationToken);
}
