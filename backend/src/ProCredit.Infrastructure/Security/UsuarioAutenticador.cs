using Microsoft.Extensions.Options;
using ProCredit.Application.Abstractions;
using ProCredit.Infrastructure.Options;

namespace ProCredit.Infrastructure.Security;

public sealed class UsuarioAutenticador(IOptions<UsuarioPruebaOptions> options) : IUsuarioAutenticador
{
    private readonly UsuarioPruebaOptions _usuarioPrueba = options.Value;

    public bool Validar(string usuario, string clave) =>
        string.Equals(usuario, _usuarioPrueba.Usuario, StringComparison.OrdinalIgnoreCase)
        && string.Equals(clave, _usuarioPrueba.Clave, StringComparison.Ordinal);
}
