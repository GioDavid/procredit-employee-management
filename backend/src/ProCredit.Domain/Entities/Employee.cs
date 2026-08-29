namespace ProCredit.Domain.Entities;

public sealed class Employee
{
    public int EmployeeId { get; init; }
    public required string DocumentNumber { get; init; }
    public required string FirstNames { get; init; }
    public required string LastNames { get; init; }
    public int Age { get; init; }
    public decimal MonthlySalary { get; init; }
    public int DepartmentId { get; init; }
    public required string Department { get; init; }
    public int PositionId { get; init; }
    public required string Position { get; init; }
}
