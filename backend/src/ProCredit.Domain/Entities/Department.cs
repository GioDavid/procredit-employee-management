namespace ProCredit.Domain.Entities;

public sealed class Department
{
    public int DepartmentId { get; init; }
    public required string Name { get; init; }
}
