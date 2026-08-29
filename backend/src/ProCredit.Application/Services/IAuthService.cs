using ProCredit.Application.Dtos;

namespace ProCredit.Application.Services;

public interface IAuthService
{
    LoginResponse? Authenticate(LoginRequest request);
}
