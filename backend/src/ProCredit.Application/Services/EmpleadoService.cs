using ProCredit.Application.Abstractions;
using ProCredit.Application.Dtos;
using ProCredit.Application.Exceptions;
using ProCredit.Domain.Entities;

namespace ProCredit.Application.Services;

public sealed class EmpleadoService(
    IEmpleadoRepository empleadoRepository,
    ICatalogoRepository catalogoRepository) : IEmpleadoService
{
    public async Task<IReadOnlyList<EmpleadoDto>> ConsultarAsync(string? departamento, CancellationToken cancellationToken)
    {
        var empleados = await empleadoRepository.ConsultarAsync(departamento, cancellationToken);
        return empleados.Select(Map).ToList();
    }

    public async Task<EmpleadoDto> AgregarAsync(CrearEmpleadoRequest request, CancellationToken cancellationToken)
    {
        var numeroDocumento = request.NumeroDocumento.Trim();

        if (await empleadoRepository.ExisteDocumentoAsync(numeroDocumento, cancellationToken))
        {
            throw new ConflictoException($"Ya existe un empleado con el numero de documento {numeroDocumento}.");
        }

        var departamentos = await catalogoRepository.ObtenerDepartamentosAsync(cancellationToken);
        var departamento = departamentos.FirstOrDefault(d => d.DepartamentoId == request.DepartamentoId)
            ?? throw new ReglaNegocioException($"El departamento {request.DepartamentoId} no existe.");

        var cargos = await catalogoRepository.ObtenerCargosAsync(cancellationToken);
        var cargo = cargos.FirstOrDefault(c => c.CargoId == request.CargoId)
            ?? throw new ReglaNegocioException($"El cargo {request.CargoId} no existe.");

        var empleado = new Empleado
        {
            NumeroDocumento = numeroDocumento,
            Nombres = request.Nombres.Trim(),
            Apellidos = request.Apellidos.Trim(),
            Edad = request.Edad,
            RemuneracionMensual = request.RemuneracionMensual,
            DepartamentoId = departamento.DepartamentoId,
            Departamento = departamento.Nombre,
            CargoId = cargo.CargoId,
            Cargo = cargo.Nombre
        };

        var empleadoId = await empleadoRepository.AgregarAsync(empleado, cancellationToken);
        var creado = await empleadoRepository.ObtenerPorIdAsync(empleadoId, cancellationToken)
            ?? throw new ReglaNegocioException("No se pudo recuperar el empleado recien creado.");

        return Map(creado);
    }

    private static EmpleadoDto Map(Empleado e) => new(
        e.EmpleadoId,
        e.NumeroDocumento,
        e.Nombres,
        e.Apellidos,
        e.Edad,
        e.RemuneracionMensual,
        e.DepartamentoId,
        e.Departamento,
        e.CargoId,
        e.Cargo);
}
