using System.ComponentModel.DataAnnotations;
using ProCredit.Application.Dtos;

namespace ProCredit.Application.Tests;

public sealed class CreateEmployeeRequestValidationTests
{
    [Fact]
    public void Validate_WithValidData_ProducesNoErrors()
    {
        var request = ValidRequest();

        var results = Validate(request);

        Assert.Empty(results);
    }

    [Fact]
    public void Validate_WhenDocumentNumberIsTooShort_ProducesError()
    {
        var request = ValidRequest(documentNumber: "12345");

        var results = Validate(request);

        Assert.Contains(results, r => HasMember(r, nameof(CreateEmployeeRequest.DocumentNumber)));
    }

    [Fact]
    public void Validate_WhenDocumentNumberIsTooLong_ProducesError()
    {
        var request = ValidRequest(documentNumber: new string('1', 21));

        var results = Validate(request);

        Assert.Contains(results, r => HasMember(r, nameof(CreateEmployeeRequest.DocumentNumber)));
    }

    [Fact]
    public void Validate_WhenFirstNamesIsEmpty_ProducesError()
    {
        var request = ValidRequest(firstNames: "");

        var results = Validate(request);

        Assert.Contains(results, r => HasMember(r, nameof(CreateEmployeeRequest.FirstNames)));
    }

    [Fact]
    public void Validate_WhenLastNamesIsEmpty_ProducesError()
    {
        var request = ValidRequest(lastNames: "");

        var results = Validate(request);

        Assert.Contains(results, r => HasMember(r, nameof(CreateEmployeeRequest.LastNames)));
    }

    [Fact]
    public void Validate_WhenAgeIsBelow18_ProducesError()
    {
        var request = ValidRequest(age: 17);

        var results = Validate(request);

        Assert.Contains(results, r => HasMember(r, nameof(CreateEmployeeRequest.Age)));
    }

    [Fact]
    public void Validate_WhenAgeIsAbove100_ProducesError()
    {
        var request = ValidRequest(age: 101);

        var results = Validate(request);

        Assert.Contains(results, r => HasMember(r, nameof(CreateEmployeeRequest.Age)));
    }

    [Fact]
    public void Validate_WhenMonthlySalaryIsNotGreaterThanZero_ProducesError()
    {
        var request = ValidRequest(monthlySalary: 0m);

        var results = Validate(request);

        Assert.Contains(results, r => HasMember(r, nameof(CreateEmployeeRequest.MonthlySalary)));
    }

    [Fact]
    public void Validate_WhenDepartmentIdIsLessThan1_ProducesError()
    {
        var request = ValidRequest(departmentId: 0);

        var results = Validate(request);

        Assert.Contains(results, r => HasMember(r, nameof(CreateEmployeeRequest.DepartmentId)));
    }

    [Fact]
    public void Validate_WhenPositionIdIsLessThan1_ProducesError()
    {
        var request = ValidRequest(positionId: 0);

        var results = Validate(request);

        Assert.Contains(results, r => HasMember(r, nameof(CreateEmployeeRequest.PositionId)));
    }

    private static CreateEmployeeRequest ValidRequest(
        string documentNumber = "12345678",
        string firstNames = "Ana María",
        string lastNames = "Pérez Rojas",
        int age = 34,
        decimal monthlySalary = 4500.00m,
        int departmentId = 1,
        int positionId = 1) => new()
    {
        DocumentNumber = documentNumber,
        FirstNames = firstNames,
        LastNames = lastNames,
        Age = age,
        MonthlySalary = monthlySalary,
        DepartmentId = departmentId,
        PositionId = positionId
    };

    private static List<ValidationResult> Validate(CreateEmployeeRequest request)
    {
        var results = new List<ValidationResult>();
        var context = new ValidationContext(request);
        Validator.TryValidateObject(request, context, results, validateAllProperties: true);
        return results;
    }

    private static bool HasMember(ValidationResult result, string memberName) =>
        result.MemberNames.Contains(memberName);
}
