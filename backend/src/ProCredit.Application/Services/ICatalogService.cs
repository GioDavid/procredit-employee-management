using ProCredit.Application.Dtos;

namespace ProCredit.Application.Services;

public interface ICatalogService
{
    Task<IReadOnlyList<CatalogDto>> GetDepartmentsAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<CatalogDto>> GetPositionsAsync(CancellationToken cancellationToken);
}
