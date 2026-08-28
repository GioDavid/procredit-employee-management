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
                "Falta la cadena de conexion 'ConnectionStrings__ProCreditRRHH'. Ver backend/.env.example.");
        }

        services.Configure<UsuarioPruebaOptions>(configuration.GetSection(UsuarioPruebaOptions.SectionName));
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));

        services.AddSingleton<ISqlConnectionFactory>(new SqlConnectionFactory(connectionString));
        services.AddScoped<IEmpleadoRepository, EmpleadoRepository>();
        services.AddScoped<ICatalogoRepository, CatalogoRepository>();
        services.AddSingleton<IUsuarioAutenticador, UsuarioAutenticador>();
        services.AddSingleton<ITokenService, JwtTokenService>();

        return services;
    }
}
