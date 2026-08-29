using ProCredit.Domain.Entities;

namespace ProCredit.Application.Abstractions;

public interface ICatalogRepository
{
    Task<IReadOnlyList<Department>> GetDepartmentsAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<Position>> GetPositionsAsync(CancellationToken cancellationToken);
}
