using ProCredit.Application.Abstractions;
using ProCredit.Domain.Entities;

namespace ProCredit.Application.Tests.Fakes;

public sealed class FakeEmployeeRepository : IEmployeeRepository
{
    public IReadOnlyList<Employee> EmployeesQuery { get; set; } = [];

    public string? DepartmentQueried { get; private set; }

    public bool DocumentExists { get; set; }

    public string? DocumentQueried { get; private set; }

    public Employee? EmployeeCreated { get; private set; }

    public int NextId { get; set; } = 1;

    public Employee? EmployeeById { get; set; }

    public Task<IReadOnlyList<Employee>> GetEmployeesAsync(string? department, CancellationToken cancellationToken)
    {
        DepartmentQueried = department;
        return Task.FromResult(EmployeesQuery);
    }

    public Task<bool> DocumentExistsAsync(string documentNumber, CancellationToken cancellationToken)
    {
        DocumentQueried = documentNumber;
        return Task.FromResult(DocumentExists);
    }

    public Task<int> CreateAsync(Employee employee, CancellationToken cancellationToken)
    {
        var employeeId = NextId;
        EmployeeCreated = new Employee
        {
            EmployeeId = employeeId,
            DocumentNumber = employee.DocumentNumber,
            FirstNames = employee.FirstNames,
            LastNames = employee.LastNames,
            Age = employee.Age,
            MonthlySalary = employee.MonthlySalary,
            DepartmentId = employee.DepartmentId,
            Department = employee.Department,
            PositionId = employee.PositionId,
            Position = employee.Position
        };

        return Task.FromResult(employeeId);
    }

    public Task<Employee?> GetByIdAsync(int employeeId, CancellationToken cancellationToken)
    {
        if (EmployeeById is not null)
        {
            return Task.FromResult<Employee?>(EmployeeById);
        }

        if (EmployeeCreated is not null && EmployeeCreated.EmployeeId == employeeId)
        {
            return Task.FromResult<Employee?>(EmployeeCreated);
        }

        return Task.FromResult<Employee?>(null);
    }
}
