using Microsoft.Extensions.DependencyInjection;
using ProCredit.Application.Services;

namespace ProCredit.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<ICatalogService, CatalogService>();
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}
