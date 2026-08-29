namespace ProCredit.Application.Dtos;

public sealed record EmployeeDto(
    int EmployeeId,
    string DocumentNumber,
    string FirstNames,
    string LastNames,
    int Age,
    decimal MonthlySalary,
    int DepartmentId,
    string Department,
    int PositionId,
    string Position);
