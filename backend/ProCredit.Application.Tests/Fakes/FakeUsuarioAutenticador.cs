using ProCredit.Application.Abstractions;

namespace ProCredit.Application.Tests.Fakes;

public sealed class FakeUsuarioAutenticador : IUsuarioAutenticador
{
    public bool Resultado { get; set; }

    public int Llamadas { get; private set; }

    public bool Validar(string usuario, string clave)
    {
        Llamadas++;
        return Resultado;
    }
}
