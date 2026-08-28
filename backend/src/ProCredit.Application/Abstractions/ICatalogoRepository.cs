using ProCredit.Domain.Entities;

namespace ProCredit.Application.Abstractions;

public interface ICatalogoRepository
{
    Task<IReadOnlyList<Departamento>> ObtenerDepartamentosAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<Cargo>> ObtenerCargosAsync(CancellationToken cancellationToken);
}
