using ProCredit.Application.Dtos;
using ProCredit.Application.Exceptions;
using ProCredit.Application.Services;
using ProCredit.Application.Tests.Fakes;
using ProCredit.Domain.Entities;

namespace ProCredit.Application.Tests;

public sealed class EmployeeServiceTests
{
    private static readonly Department SystemsDepartment = new()
    {
        DepartmentId = 1,
        Name = "Sistemas"
    };

    private static readonly Position SpecialistPosition = new()
    {
        PositionId = 1,
        Name = "Especialista de Sistemas"
    };

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public async Task GetEmployeesAsync_WhenDepartmentIsNullOrEmpty_QueriesWithoutFilterAndMapsEmployees(
        string? department)
    {
        var employeeRepository = new FakeEmployeeRepository
        {
            EmployeesQuery =
            [
                new Employee
                {
                    EmployeeId = 10,
                    DocumentNumber = "12345678",
                    FirstNames = "Ana María",
                    LastNames = "Pérez Rojas",
                    Age = 34,
                    MonthlySalary = 4500.00m,
                    DepartmentId = 1,
                    Department = "Sistemas",
                    PositionId = 1,
                    Position = "Especialista de Sistemas"
                }
            ]
        };
        var sut = new EmployeeService(employeeRepository, new FakeCatalogRepository());

        var result = await sut.GetEmployeesAsync(department, CancellationToken.None);

        Assert.Equal(department, employeeRepository.DepartmentQueried);
        var dto = Assert.Single(result);
        Assert.Equal(10, dto.EmployeeId);
        Assert.Equal("12345678", dto.DocumentNumber);
        Assert.Equal("Ana María", dto.FirstNames);
        Assert.Equal("Pérez Rojas", dto.LastNames);
        Assert.Equal(34, dto.Age);
        Assert.Equal(4500.00m, dto.MonthlySalary);
        Assert.Equal(1, dto.DepartmentId);
        Assert.Equal("Sistemas", dto.Department);
        Assert.Equal(1, dto.PositionId);
        Assert.Equal("Especialista de Sistemas", dto.Position);
    }

    [Fact]
    public async Task GetEmployeesAsync_WhenDepartmentIsProvided_ForwardsItToTheRepository()
    {
        var employeeRepository = new FakeEmployeeRepository();
        var sut = new EmployeeService(employeeRepository, new FakeCatalogRepository());

        await sut.GetEmployeesAsync("Sistemas", CancellationToken.None);

        Assert.Equal("Sistemas", employeeRepository.DepartmentQueried);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_PersistsAndReturnsCreatedEmployee()
    {
        var employeeRepository = new FakeEmployeeRepository { NextId = 42 };
        var catalogRepository = ValidCatalogs();
        var sut = new EmployeeService(employeeRepository, catalogRepository);
        var request = new CreateEmployeeRequest
        {
            DocumentNumber = "  12345678  ",
            FirstNames = "  Ana María  ",
            LastNames = "  Pérez Rojas  ",
            Age = 34,
            MonthlySalary = 4500.00m,
            DepartmentId = 1,
            PositionId = 1
        };

        var dto = await sut.CreateAsync(request, CancellationToken.None);

        Assert.Equal("12345678", employeeRepository.DocumentQueried);
        Assert.NotNull(employeeRepository.EmployeeCreated);
        Assert.Equal("12345678", employeeRepository.EmployeeCreated.DocumentNumber);
        Assert.Equal("Ana María", employeeRepository.EmployeeCreated.FirstNames);
        Assert.Equal("Pérez Rojas", employeeRepository.EmployeeCreated.LastNames);
        Assert.Equal(42, dto.EmployeeId);
        Assert.Equal("12345678", dto.DocumentNumber);
        Assert.Equal("Ana María", dto.FirstNames);
        Assert.Equal("Pérez Rojas", dto.LastNames);
        Assert.Equal(34, dto.Age);
        Assert.Equal(4500.00m, dto.MonthlySalary);
        Assert.Equal(1, dto.DepartmentId);
        Assert.Equal("Sistemas", dto.Department);
        Assert.Equal(1, dto.PositionId);
        Assert.Equal("Especialista de Sistemas", dto.Position);
    }

    [Fact]
    public async Task CreateAsync_WhenDocumentAlreadyExists_ThrowsConflictException()
    {
        var employeeRepository = new FakeEmployeeRepository { DocumentExists = true };
        var sut = new EmployeeService(employeeRepository, ValidCatalogs());
        var request = ValidRequest();

        var ex = await Assert.ThrowsAsync<ConflictException>(
            () => sut.CreateAsync(request, CancellationToken.None));

        Assert.Contains("12345678", ex.Message);
        Assert.Null(employeeRepository.EmployeeCreated);
    }

    [Fact]
    public async Task CreateAsync_WhenDepartmentDoesNotExist_ThrowsBusinessRuleException()
    {
        var employeeRepository = new FakeEmployeeRepository();
        var catalogRepository = new FakeCatalogRepository
        {
            Departments = [new Department { DepartmentId = 2, Name = "Finanzas" }],
            Positions = [SpecialistPosition]
        };
        var sut = new EmployeeService(employeeRepository, catalogRepository);

        var ex = await Assert.ThrowsAsync<BusinessRuleException>(
            () => sut.CreateAsync(ValidRequest(), CancellationToken.None));

        Assert.Contains("departamento", ex.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Null(employeeRepository.EmployeeCreated);
        Assert.IsNotType<ConflictException>(ex);
    }

    [Fact]
    public async Task CreateAsync_WhenPositionDoesNotExist_ThrowsBusinessRuleException()
    {
        var employeeRepository = new FakeEmployeeRepository();
        var catalogRepository = new FakeCatalogRepository
        {
            Departments = [SystemsDepartment],
            Positions = [new Position { PositionId = 2, Name = "Contador Senior" }]
        };
        var sut = new EmployeeService(employeeRepository, catalogRepository);

        var ex = await Assert.ThrowsAsync<BusinessRuleException>(
            () => sut.CreateAsync(ValidRequest(), CancellationToken.None));

        Assert.Contains("cargo", ex.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Null(employeeRepository.EmployeeCreated);
        Assert.IsNotType<ConflictException>(ex);
    }

    private static FakeCatalogRepository ValidCatalogs() => new()
    {
        Departments = [SystemsDepartment],
        Positions = [SpecialistPosition]
    };

    private static CreateEmployeeRequest ValidRequest() => new()
    {
        DocumentNumber = "12345678",
        FirstNames = "Ana María",
        LastNames = "Pérez Rojas",
        Age = 34,
        MonthlySalary = 4500.00m,
        DepartmentId = 1,
        PositionId = 1
    };
}
