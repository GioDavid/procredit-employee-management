using System.Data;
using Microsoft.Data.SqlClient;
using ProCredit.Application.Abstractions;
using ProCredit.Domain.Entities;

namespace ProCredit.Infrastructure.Persistence;

public sealed class EmployeeRepository(ISqlConnectionFactory connectionFactory) : IEmployeeRepository
{
    public async Task<IReadOnlyList<Employee>> GetEmployeesAsync(string? department, CancellationToken cancellationToken)
    {
        await using var connection = connectionFactory.Create();
        await using var command = new SqlCommand("dbo.usp_Employee_Get", connection)
        {
            CommandType = CommandType.StoredProcedure
        };
        command.Parameters.Add("@Department", SqlDbType.NVarChar, 100).Value =
            string.IsNullOrWhiteSpace(department) ? DBNull.Value : department.Trim();

        await connection.OpenAsync(cancellationToken);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var employees = new List<Employee>();
        while (await reader.ReadAsync(cancellationToken))
        {
            employees.Add(Read(reader));
        }

        return employees;
    }

    public async Task<Employee?> GetByIdAsync(int employeeId, CancellationToken cancellationToken)
    {
        var employees = await GetEmployeesAsync(null, cancellationToken);
        return employees.FirstOrDefault(e => e.EmployeeId == employeeId);
    }

    public async Task<bool> DocumentExistsAsync(string documentNumber, CancellationToken cancellationToken)
    {
        await using var connection = connectionFactory.Create();
        await using var command = new SqlCommand(
            "SELECT COUNT(1) FROM dbo.Employees WHERE DocumentNumber = @DocumentNumber;", connection);
        command.Parameters.Add("@DocumentNumber", SqlDbType.VarChar, 20).Value = documentNumber;

        await connection.OpenAsync(cancellationToken);
        var total = (int)(await command.ExecuteScalarAsync(cancellationToken) ?? 0);
        return total > 0;
    }

    public async Task<int> CreateAsync(Employee employee, CancellationToken cancellationToken)
    {
        await using var connection = connectionFactory.Create();
        await using var command = new SqlCommand(
            """
            INSERT INTO dbo.Employees
                (DocumentNumber, FirstNames, LastNames, Age, MonthlySalary, DepartmentId, PositionId)
            OUTPUT INSERTED.EmployeeId
            VALUES
                (@DocumentNumber, @FirstNames, @LastNames, @Age, @MonthlySalary, @DepartmentId, @PositionId);
            """, connection);

        command.Parameters.Add("@DocumentNumber", SqlDbType.VarChar, 20).Value = employee.DocumentNumber;
        command.Parameters.Add("@FirstNames", SqlDbType.NVarChar, 100).Value = employee.FirstNames;
        command.Parameters.Add("@LastNames", SqlDbType.NVarChar, 100).Value = employee.LastNames;
        command.Parameters.Add("@Age", SqlDbType.Int).Value = employee.Age;
        command.Parameters.Add("@MonthlySalary", SqlDbType.Decimal).Value = employee.MonthlySalary;
        command.Parameters["@MonthlySalary"].Precision = 18;
        command.Parameters["@MonthlySalary"].Scale = 2;
        command.Parameters.Add("@DepartmentId", SqlDbType.Int).Value = employee.DepartmentId;
        command.Parameters.Add("@PositionId", SqlDbType.Int).Value = employee.PositionId;

        await connection.OpenAsync(cancellationToken);
        return (int)(await command.ExecuteScalarAsync(cancellationToken) ?? 0);
    }

    private static Employee Read(SqlDataReader reader) => new()
    {
        EmployeeId = reader.GetInt32(reader.GetOrdinal("EmployeeId")),
        DocumentNumber = reader.GetString(reader.GetOrdinal("DocumentNumber")),
        FirstNames = reader.GetString(reader.GetOrdinal("FirstNames")),
        LastNames = reader.GetString(reader.GetOrdinal("LastNames")),
        Age = reader.GetInt32(reader.GetOrdinal("Age")),
        MonthlySalary = reader.GetDecimal(reader.GetOrdinal("MonthlySalary")),
        DepartmentId = reader.GetInt32(reader.GetOrdinal("DepartmentId")),
        Department = reader.GetString(reader.GetOrdinal("Department")),
        PositionId = reader.GetInt32(reader.GetOrdinal("PositionId")),
        Position = reader.GetString(reader.GetOrdinal("Position"))
    };
}
