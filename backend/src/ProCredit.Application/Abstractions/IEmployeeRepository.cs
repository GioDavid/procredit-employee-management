using ProCredit.Domain.Entities;

namespace ProCredit.Application.Abstractions;

public interface IEmployeeRepository
{
    Task<IReadOnlyList<Employee>> GetEmployeesAsync(string? department, CancellationToken cancellationToken);

    Task<bool> DocumentExistsAsync(string documentNumber, CancellationToken cancellationToken);

    Task<int> CreateAsync(Employee employee, CancellationToken cancellationToken);

    Task<Employee?> GetByIdAsync(int employeeId, CancellationToken cancellationToken);
}
