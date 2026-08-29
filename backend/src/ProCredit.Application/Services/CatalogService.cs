using ProCredit.Application.Abstractions;
using ProCredit.Application.Dtos;

namespace ProCredit.Application.Services;

public sealed class CatalogService(ICatalogRepository catalogRepository) : ICatalogService
{
    public async Task<IReadOnlyList<CatalogDto>> GetDepartmentsAsync(CancellationToken cancellationToken)
    {
        var departments = await catalogRepository.GetDepartmentsAsync(cancellationToken);
        return departments.Select(d => new CatalogDto(d.DepartmentId, d.Name)).ToList();
    }

    public async Task<IReadOnlyList<CatalogDto>> GetPositionsAsync(CancellationToken cancellationToken)
    {
        var positions = await catalogRepository.GetPositionsAsync(cancellationToken);
        return positions.Select(p => new CatalogDto(p.PositionId, p.Name)).ToList();
    }
}
