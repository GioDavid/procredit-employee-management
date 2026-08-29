using ProCredit.Application.Dtos;
using ProCredit.Application.Services;
using ProCredit.Application.Tests.Fakes;

namespace ProCredit.Application.Tests;

public sealed class AuthServiceTests
{
    [Fact]
    public void Authenticate_WithValidCredentials_ReturnsTokenAndExpiration()
    {
        var authenticator = new FakeUserAuthenticator { Result = true };
        var tokenService = new FakeTokenService
        {
            Token = "jwt-valido",
            ExpiresAt = new DateTime(2026, 8, 29, 14, 0, 0, DateTimeKind.Utc)
        };
        var sut = new AuthService(authenticator, tokenService);
        var request = new LoginRequest { Username = "admin", Password = "Secreto123" };

        var response = sut.Authenticate(request);

        Assert.NotNull(response);
        Assert.Equal("jwt-valido", response.Token);
        Assert.Equal(tokenService.ExpiresAt, response.ExpiresAt);
        Assert.Equal("admin", tokenService.GeneratedUsername);
        Assert.Equal(1, tokenService.CallCount);
    }

    [Fact]
    public void Authenticate_WithInvalidCredentials_ReturnsNullAndDoesNotGenerateToken()
    {
        var authenticator = new FakeUserAuthenticator { Result = false };
        var tokenService = new FakeTokenService();
        var sut = new AuthService(authenticator, tokenService);
        var request = new LoginRequest { Username = "admin", Password = "incorrecta" };

        var response = sut.Authenticate(request);

        Assert.Null(response);
        Assert.Equal(0, tokenService.CallCount);
        Assert.Null(tokenService.GeneratedUsername);
    }
}
