using ProCredit.Application.Abstractions;
using ProCredit.Application.Dtos;

namespace ProCredit.Application.Services;

public sealed class AuthService(IUserAuthenticator authenticator, ITokenService tokenService) : IAuthService
{
    public LoginResponse? Authenticate(LoginRequest request)
    {
        if (!authenticator.Validate(request.Username, request.Password))
        {
            return null;
        }

        var (token, expiresAt) = tokenService.Generate(request.Username);
        return new LoginResponse(token, expiresAt);
    }
}
