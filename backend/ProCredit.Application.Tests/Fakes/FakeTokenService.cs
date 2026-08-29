using ProCredit.Application.Abstractions;

namespace ProCredit.Application.Tests.Fakes;

public sealed class FakeTokenService : ITokenService
{
    public string Token { get; set; } = "token-de-prueba";

    public DateTime ExpiraEn { get; set; } = new(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc);

    public string? UsuarioGenerado { get; private set; }

    public int Llamadas { get; private set; }

    public (string Token, DateTime ExpiraEn) Generar(string usuario)
    {
        Llamadas++;
        UsuarioGenerado = usuario;
        return (Token, ExpiraEn);
    }
}
