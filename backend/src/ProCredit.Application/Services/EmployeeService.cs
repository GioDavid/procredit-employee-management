using ProCredit.Application.Abstractions;
using ProCredit.Application.Dtos;
using ProCredit.Application.Exceptions;
using ProCredit.Domain.Entities;

namespace ProCredit.Application.Services;

public sealed class EmployeeService(
    IEmployeeRepository employeeRepository,
    ICatalogRepository catalogRepository) : IEmployeeService
{
    public async Task<IReadOnlyList<EmployeeDto>> GetEmployeesAsync(string? department, CancellationToken cancellationToken)
    {
        var employees = await employeeRepository.GetEmployeesAsync(department, cancellationToken);
        return employees.Select(Map).ToList();
    }

    public async Task<EmployeeDto> CreateAsync(CreateEmployeeRequest request, CancellationToken cancellationToken)
    {
        var documentNumber = request.DocumentNumber.Trim();

        if (await employeeRepository.DocumentExistsAsync(documentNumber, cancellationToken))
        {
            throw new ConflictException($"Ya existe un empleado con el numero de documento {documentNumber}.");
        }

        var departments = await catalogRepository.GetDepartmentsAsync(cancellationToken);
        var department = departments.FirstOrDefault(d => d.DepartmentId == request.DepartmentId)
            ?? throw new BusinessRuleException($"El departamento {request.DepartmentId} no existe.");

        var positions = await catalogRepository.GetPositionsAsync(cancellationToken);
        var position = positions.FirstOrDefault(p => p.PositionId == request.PositionId)
            ?? throw new BusinessRuleException($"El cargo {request.PositionId} no existe.");

        var employee = new Employee
        {
            DocumentNumber = documentNumber,
            FirstNames = request.FirstNames.Trim(),
            LastNames = request.LastNames.Trim(),
            Age = request.Age,
            MonthlySalary = request.MonthlySalary,
            DepartmentId = department.DepartmentId,
            Department = department.Name,
            PositionId = position.PositionId,
            Position = position.Name
        };

        var employeeId = await employeeRepository.CreateAsync(employee, cancellationToken);
        var created = await employeeRepository.GetByIdAsync(employeeId, cancellationToken)
            ?? throw new BusinessRuleException("No se pudo recuperar el empleado recien creado.");

        return Map(created);
    }

    private static EmployeeDto Map(Employee e) => new(
        e.EmployeeId,
        e.DocumentNumber,
        e.FirstNames,
        e.LastNames,
        e.Age,
        e.MonthlySalary,
        e.DepartmentId,
        e.Department,
        e.PositionId,
        e.Position);
}
