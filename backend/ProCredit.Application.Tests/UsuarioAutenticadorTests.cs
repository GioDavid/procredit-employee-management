using Microsoft.Extensions.Options;
using ProCredit.Infrastructure.Options;
using ProCredit.Infrastructure.Security;

namespace ProCredit.Application.Tests;

public sealed class UsuarioAutenticadorTests
{
    private static UsuarioAutenticador CrearSut()
    {
        var options = Options.Create(new UsuarioPruebaOptions
        {
            Usuario = "admin",
            Clave = "Secreto123"
        });

        return new UsuarioAutenticador(options);
    }

    [Fact]
    public void Validar_ConUsuarioYClaveCorrectos_RetornaTrue()
    {
        var sut = CrearSut();

        var resultado = sut.Validar("admin", "Secreto123");

        Assert.True(resultado);
    }

    [Fact]
    public void Validar_ConClaveIncorrecta_RetornaFalse()
    {
        var sut = CrearSut();

        var resultado = sut.Validar("admin", "otra-clave");

        Assert.False(resultado);
    }

    [Fact]
    public void Validar_ConUsuarioEnDistintoCasing_RetornaTrue()
    {
        var sut = CrearSut();

        var resultado = sut.Validar("ADMIN", "Secreto123");

        Assert.True(resultado);
    }

    [Fact]
    public void Validar_ConClaveEnDistintoCasing_RetornaFalse()
    {
        var sut = CrearSut();

        var resultado = sut.Validar("admin", "secreto123");

        Assert.False(resultado);
    }
}
