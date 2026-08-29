using System.ComponentModel.DataAnnotations;

namespace ProCredit.Application.Dtos;

public sealed class CreateEmployeeRequest
{
    [Required, StringLength(20, MinimumLength = 6)]
    public string DocumentNumber { get; init; } = string.Empty;

    [Required, StringLength(100)]
    public string FirstNames { get; init; } = string.Empty;

    [Required, StringLength(100)]
    public string LastNames { get; init; } = string.Empty;

    [Range(18, 100)]
    public int Age { get; init; }

    [Range(0.01, 9999999999999999.99)]
    public decimal MonthlySalary { get; init; }

    [Range(1, int.MaxValue)]
    public int DepartmentId { get; init; }

    [Range(1, int.MaxValue)]
    public int PositionId { get; init; }
}
