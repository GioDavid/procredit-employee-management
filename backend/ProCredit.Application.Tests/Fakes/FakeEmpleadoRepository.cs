using ProCredit.Application.Abstractions;
using ProCredit.Domain.Entities;

namespace ProCredit.Application.Tests.Fakes;

public sealed class FakeEmpleadoRepository : IEmpleadoRepository
{
    public IReadOnlyList<Empleado> EmpleadosConsulta { get; set; } = [];

    public string? DepartamentoConsultado { get; private set; }

    public bool ExisteDocumento { get; set; }

    public string? DocumentoConsultado { get; private set; }

    public Empleado? EmpleadoAgregado { get; private set; }

    public int ProximoId { get; set; } = 1;

    public Empleado? EmpleadoPorId { get; set; }

    public Task<IReadOnlyList<Empleado>> ConsultarAsync(string? departamento, CancellationToken cancellationToken)
    {
        DepartamentoConsultado = departamento;
        return Task.FromResult(EmpleadosConsulta);
    }

    public Task<bool> ExisteDocumentoAsync(string numeroDocumento, CancellationToken cancellationToken)
    {
        DocumentoConsultado = numeroDocumento;
        return Task.FromResult(ExisteDocumento);
    }

    public Task<int> AgregarAsync(Empleado empleado, CancellationToken cancellationToken)
    {
        var empleadoId = ProximoId;
        EmpleadoAgregado = new Empleado
        {
            EmpleadoId = empleadoId,
            NumeroDocumento = empleado.NumeroDocumento,
            Nombres = empleado.Nombres,
            Apellidos = empleado.Apellidos,
            Edad = empleado.Edad,
            RemuneracionMensual = empleado.RemuneracionMensual,
            DepartamentoId = empleado.DepartamentoId,
            Departamento = empleado.Departamento,
            CargoId = empleado.CargoId,
            Cargo = empleado.Cargo
        };

        return Task.FromResult(empleadoId);
    }

    public Task<Empleado?> ObtenerPorIdAsync(int empleadoId, CancellationToken cancellationToken)
    {
        if (EmpleadoPorId is not null)
        {
            return Task.FromResult<Empleado?>(EmpleadoPorId);
        }

        if (EmpleadoAgregado is not null && EmpleadoAgregado.EmpleadoId == empleadoId)
        {
            return Task.FromResult<Empleado?>(EmpleadoAgregado);
        }

        return Task.FromResult<Empleado?>(null);
    }
}
