using ProCredit.Application.Dtos;

namespace ProCredit.Application.Services;

public interface IEmployeeService
{
    Task<IReadOnlyList<EmployeeDto>> GetEmployeesAsync(string? department, CancellationToken cancellationToken);

    Task<EmployeeDto> CreateAsync(CreateEmployeeRequest request, CancellationToken cancellationToken);
}
