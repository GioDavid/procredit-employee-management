using Microsoft.Data.SqlClient;
using ProCredit.Application.Abstractions;
using ProCredit.Domain.Entities;

namespace ProCredit.Infrastructure.Persistence;

public sealed class CatalogoRepository(ISqlConnectionFactory connectionFactory) : ICatalogoRepository
{
    public async Task<IReadOnlyList<Departamento>> ObtenerDepartamentosAsync(CancellationToken cancellationToken)
    {
        await using var connection = connectionFactory.Crear();
        await using var command = new SqlCommand(
            "SELECT DepartamentoId, Nombre FROM dbo.Departamento ORDER BY Nombre;", connection);

        await connection.OpenAsync(cancellationToken);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var departamentos = new List<Departamento>();
        while (await reader.ReadAsync(cancellationToken))
        {
            departamentos.Add(new Departamento { DepartamentoId = reader.GetInt32(0), Nombre = reader.GetString(1) });
        }

        return departamentos;
    }

    public async Task<IReadOnlyList<Cargo>> ObtenerCargosAsync(CancellationToken cancellationToken)
    {
        await using var connection = connectionFactory.Crear();
        await using var command = new SqlCommand(
            "SELECT CargoId, Nombre FROM dbo.Cargo ORDER BY Nombre;", connection);

        await connection.OpenAsync(cancellationToken);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var cargos = new List<Cargo>();
        while (await reader.ReadAsync(cancellationToken))
        {
            cargos.Add(new Cargo { CargoId = reader.GetInt32(0), Nombre = reader.GetString(1) });
        }

        return cargos;
    }
}
