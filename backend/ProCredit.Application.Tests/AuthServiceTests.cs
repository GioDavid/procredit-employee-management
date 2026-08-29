using ProCredit.Application.Dtos;
using ProCredit.Application.Services;
using ProCredit.Application.Tests.Fakes;

namespace ProCredit.Application.Tests;

public sealed class AuthServiceTests
{
    [Fact]
    public void Autenticar_ConCredencialesValidas_RetornaTokenYExpiracion()
    {
        var autenticador = new FakeUsuarioAutenticador { Resultado = true };
        var tokenService = new FakeTokenService
        {
            Token = "jwt-valido",
            ExpiraEn = new DateTime(2026, 8, 29, 14, 0, 0, DateTimeKind.Utc)
        };
        var sut = new AuthService(autenticador, tokenService);
        var request = new LoginRequest { Usuario = "admin", Clave = "Secreto123" };

        var response = sut.Autenticar(request);

        Assert.NotNull(response);
        Assert.Equal("jwt-valido", response.Token);
        Assert.Equal(tokenService.ExpiraEn, response.ExpiraEn);
        Assert.Equal("admin", tokenService.UsuarioGenerado);
        Assert.Equal(1, tokenService.Llamadas);
    }

    [Fact]
    public void Autenticar_ConCredencialesInvalidas_RetornaNullYNoGeneraToken()
    {
        var autenticador = new FakeUsuarioAutenticador { Resultado = false };
        var tokenService = new FakeTokenService();
        var sut = new AuthService(autenticador, tokenService);
        var request = new LoginRequest { Usuario = "admin", Clave = "incorrecta" };

        var response = sut.Autenticar(request);

        Assert.Null(response);
        Assert.Equal(0, tokenService.Llamadas);
        Assert.Null(tokenService.UsuarioGenerado);
    }
}
