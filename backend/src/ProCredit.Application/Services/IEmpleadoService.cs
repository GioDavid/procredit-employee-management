using ProCredit.Application.Dtos;

namespace ProCredit.Application.Services;

public interface IEmpleadoService
{
    Task<IReadOnlyList<EmpleadoDto>> ConsultarAsync(string? departamento, CancellationToken cancellationToken);

    Task<EmpleadoDto> AgregarAsync(CrearEmpleadoRequest request, CancellationToken cancellationToken);
}
