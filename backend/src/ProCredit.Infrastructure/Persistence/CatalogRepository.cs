using Microsoft.Data.SqlClient;
using ProCredit.Application.Abstractions;
using ProCredit.Domain.Entities;

namespace ProCredit.Infrastructure.Persistence;

public sealed class CatalogRepository(ISqlConnectionFactory connectionFactory) : ICatalogRepository
{
    public async Task<IReadOnlyList<Department>> GetDepartmentsAsync(CancellationToken cancellationToken)
    {
        await using var connection = connectionFactory.Create();
        await using var command = new SqlCommand(
            "SELECT DepartmentId, Name FROM dbo.Departments ORDER BY Name;", connection);

        await connection.OpenAsync(cancellationToken);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var departments = new List<Department>();
        while (await reader.ReadAsync(cancellationToken))
        {
            departments.Add(new Department { DepartmentId = reader.GetInt32(0), Name = reader.GetString(1) });
        }

        return departments;
    }

    public async Task<IReadOnlyList<Position>> GetPositionsAsync(CancellationToken cancellationToken)
    {
        await using var connection = connectionFactory.Create();
        await using var command = new SqlCommand(
            "SELECT PositionId, Name FROM dbo.Positions ORDER BY Name;", connection);

        await connection.OpenAsync(cancellationToken);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var positions = new List<Position>();
        while (await reader.ReadAsync(cancellationToken))
        {
            positions.Add(new Position { PositionId = reader.GetInt32(0), Name = reader.GetString(1) });
        }

        return positions;
    }
}
