using ProCredit.Application.Abstractions;
using ProCredit.Domain.Entities;

namespace ProCredit.Application.Tests.Fakes;

public sealed class FakeCatalogRepository : ICatalogRepository
{
    public IReadOnlyList<Department> Departments { get; set; } = [];

    public IReadOnlyList<Position> Positions { get; set; } = [];

    public Task<IReadOnlyList<Department>> GetDepartmentsAsync(CancellationToken cancellationToken) =>
        Task.FromResult(Departments);

    public Task<IReadOnlyList<Position>> GetPositionsAsync(CancellationToken cancellationToken) =>
        Task.FromResult(Positions);
}
