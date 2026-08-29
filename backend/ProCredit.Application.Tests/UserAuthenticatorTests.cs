using Microsoft.Extensions.Options;
using ProCredit.Infrastructure.Options;
using ProCredit.Infrastructure.Security;

namespace ProCredit.Application.Tests;

public sealed class UserAuthenticatorTests
{
    private static UserAuthenticator CreateSut()
    {
        var options = Options.Create(new TestUserOptions
        {
            Username = "admin",
            Password = "Secreto123"
        });

        return new UserAuthenticator(options);
    }

    [Fact]
    public void Validate_WithCorrectUsernameAndPassword_ReturnsTrue()
    {
        var sut = CreateSut();

        var result = sut.Validate("admin", "Secreto123");

        Assert.True(result);
    }

    [Fact]
    public void Validate_WithIncorrectPassword_ReturnsFalse()
    {
        var sut = CreateSut();

        var result = sut.Validate("admin", "otra-clave");

        Assert.False(result);
    }

    [Fact]
    public void Validate_WithDifferentUsernameCasing_ReturnsTrue()
    {
        var sut = CreateSut();

        var result = sut.Validate("ADMIN", "Secreto123");

        Assert.True(result);
    }

    [Fact]
    public void Validate_WithDifferentPasswordCasing_ReturnsFalse()
    {
        var sut = CreateSut();

        var result = sut.Validate("admin", "secreto123");

        Assert.False(result);
    }
}
