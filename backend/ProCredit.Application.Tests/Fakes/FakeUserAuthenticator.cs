using ProCredit.Application.Abstractions;

namespace ProCredit.Application.Tests.Fakes;

public sealed class FakeUserAuthenticator : IUserAuthenticator
{
    public bool Result { get; set; }

    public int CallCount { get; private set; }

    public bool Validate(string username, string password)
    {
        CallCount++;
        return Result;
    }
}
