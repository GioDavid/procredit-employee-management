using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ProCredit.Application.Abstractions;
using ProCredit.Infrastructure.Options;
using ProCredit.Infrastructure.Persistence;
using ProCredit.Infrastructure.Security;

namespace ProCredit.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("ProCreditRRHH");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Missing connection string 'ConnectionStrings__ProCreditRRHH'. See backend/.env.example.");
        }

        services.Configure<TestUserOptions>(configuration.GetSection(TestUserOptions.SectionName));
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));

        services.AddSingleton<ISqlConnectionFactory>(new SqlConnectionFactory(connectionString));
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<ICatalogRepository, CatalogRepository>();
        services.AddSingleton<IUserAuthenticator, UserAuthenticator>();
        services.AddSingleton<ITokenService, JwtTokenService>();

        return services;
    }
}
