using ProCredit.Application.Abstractions;
using ProCredit.Application.Dtos;

namespace ProCredit.Application.Services;

public sealed class AuthService(IUsuarioAutenticador autenticador, ITokenService tokenService) : IAuthService
{
    public LoginResponse? Autenticar(LoginRequest request)
    {
        if (!autenticador.Validar(request.Usuario, request.Clave))
        {
            return null;
        }

        var (token, expiraEn) = tokenService.Generar(request.Usuario);
        return new LoginResponse(token, expiraEn);
    }
}
