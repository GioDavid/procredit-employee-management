using ProCredit.Application.Abstractions;
using ProCredit.Domain.Entities;

namespace ProCredit.Application.Tests.Fakes;

public sealed class FakeCatalogoRepository : ICatalogoRepository
{
    public IReadOnlyList<Departamento> Departamentos { get; set; } = [];

    public IReadOnlyList<Cargo> Cargos { get; set; } = [];

    public Task<IReadOnlyList<Departamento>> ObtenerDepartamentosAsync(CancellationToken cancellationToken) =>
        Task.FromResult(Departamentos);

    public Task<IReadOnlyList<Cargo>> ObtenerCargosAsync(CancellationToken cancellationToken) =>
        Task.FromResult(Cargos);
}
