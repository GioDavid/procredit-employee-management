using ProCredit.Application.Dtos;

namespace ProCredit.Application.Services;

public interface IAuthService
{
    LoginResponse? Autenticar(LoginRequest request);
}
