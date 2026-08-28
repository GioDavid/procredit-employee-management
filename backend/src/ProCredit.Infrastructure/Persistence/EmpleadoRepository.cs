using System.Data;
using Microsoft.Data.SqlClient;
using ProCredit.Application.Abstractions;
using ProCredit.Domain.Entities;

namespace ProCredit.Infrastructure.Persistence;

public sealed class EmpleadoRepository(ISqlConnectionFactory connectionFactory) : IEmpleadoRepository
{
    public async Task<IReadOnlyList<Empleado>> ConsultarAsync(string? departamento, CancellationToken cancellationToken)
    {
        await using var connection = connectionFactory.Crear();
        await using var command = new SqlCommand("dbo.usp_Empleado_Consultar", connection)
        {
            CommandType = CommandType.StoredProcedure
        };
        command.Parameters.Add("@Departamento", SqlDbType.NVarChar, 100).Value =
            string.IsNullOrWhiteSpace(departamento) ? DBNull.Value : departamento.Trim();

        await connection.OpenAsync(cancellationToken);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var empleados = new List<Empleado>();
        while (await reader.ReadAsync(cancellationToken))
        {
            empleados.Add(Leer(reader));
        }

        return empleados;
    }

    public async Task<Empleado?> ObtenerPorIdAsync(int empleadoId, CancellationToken cancellationToken)
    {
        var empleados = await ConsultarAsync(null, cancellationToken);
        return empleados.FirstOrDefault(e => e.EmpleadoId == empleadoId);
    }

    public async Task<bool> ExisteDocumentoAsync(string numeroDocumento, CancellationToken cancellationToken)
    {
        await using var connection = connectionFactory.Crear();
        await using var command = new SqlCommand(
            "SELECT COUNT(1) FROM dbo.Empleado WHERE NumeroDocumento = @NumeroDocumento;", connection);
        command.Parameters.Add("@NumeroDocumento", SqlDbType.VarChar, 20).Value = numeroDocumento;

        await connection.OpenAsync(cancellationToken);
        var total = (int)(await command.ExecuteScalarAsync(cancellationToken) ?? 0);
        return total > 0;
    }

    public async Task<int> AgregarAsync(Empleado empleado, CancellationToken cancellationToken)
    {
        await using var connection = connectionFactory.Crear();
        await using var command = new SqlCommand(
            """
            INSERT INTO dbo.Empleado
                (NumeroDocumento, Nombres, Apellidos, Edad, RemuneracionMensual, DepartamentoId, CargoId)
            OUTPUT INSERTED.EmpleadoId
            VALUES
                (@NumeroDocumento, @Nombres, @Apellidos, @Edad, @RemuneracionMensual, @DepartamentoId, @CargoId);
            """, connection);

        command.Parameters.Add("@NumeroDocumento", SqlDbType.VarChar, 20).Value = empleado.NumeroDocumento;
        command.Parameters.Add("@Nombres", SqlDbType.NVarChar, 100).Value = empleado.Nombres;
        command.Parameters.Add("@Apellidos", SqlDbType.NVarChar, 100).Value = empleado.Apellidos;
        command.Parameters.Add("@Edad", SqlDbType.Int).Value = empleado.Edad;
        command.Parameters.Add("@RemuneracionMensual", SqlDbType.Decimal).Value = empleado.RemuneracionMensual;
        command.Parameters["@RemuneracionMensual"].Precision = 18;
        command.Parameters["@RemuneracionMensual"].Scale = 2;
        command.Parameters.Add("@DepartamentoId", SqlDbType.Int).Value = empleado.DepartamentoId;
        command.Parameters.Add("@CargoId", SqlDbType.Int).Value = empleado.CargoId;

        await connection.OpenAsync(cancellationToken);
        return (int)(await command.ExecuteScalarAsync(cancellationToken) ?? 0);
    }

    private static Empleado Leer(SqlDataReader reader) => new()
    {
        EmpleadoId = reader.GetInt32(reader.GetOrdinal("EmpleadoId")),
        NumeroDocumento = reader.GetString(reader.GetOrdinal("NumeroDocumento")),
        Nombres = reader.GetString(reader.GetOrdinal("Nombres")),
        Apellidos = reader.GetString(reader.GetOrdinal("Apellidos")),
        Edad = reader.GetInt32(reader.GetOrdinal("Edad")),
        RemuneracionMensual = reader.GetDecimal(reader.GetOrdinal("RemuneracionMensual")),
        DepartamentoId = reader.GetInt32(reader.GetOrdinal("DepartamentoId")),
        Departamento = reader.GetString(reader.GetOrdinal("Departamento")),
        CargoId = reader.GetInt32(reader.GetOrdinal("CargoId")),
        Cargo = reader.GetString(reader.GetOrdinal("Cargo"))
    };
}
