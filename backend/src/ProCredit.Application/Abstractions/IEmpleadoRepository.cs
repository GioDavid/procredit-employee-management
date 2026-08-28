using ProCredit.Domain.Entities;

namespace ProCredit.Application.Abstractions;

public interface IEmpleadoRepository
{
    Task<IReadOnlyList<Empleado>> ConsultarAsync(string? departamento, CancellationToken cancellationToken);

    Task<bool> ExisteDocumentoAsync(string numeroDocumento, CancellationToken cancellationToken);

    Task<int> AgregarAsync(Empleado empleado, CancellationToken cancellationToken);

    Task<Empleado?> ObtenerPorIdAsync(int empleadoId, CancellationToken cancellationToken);
}
