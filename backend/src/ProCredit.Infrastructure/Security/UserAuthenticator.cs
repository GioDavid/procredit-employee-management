using Microsoft.Extensions.Options;
using ProCredit.Application.Abstractions;
using ProCredit.Infrastructure.Options;

namespace ProCredit.Infrastructure.Security;

public sealed class UserAuthenticator(IOptions<TestUserOptions> options) : IUserAuthenticator
{
    private readonly TestUserOptions _testUser = options.Value;

    public bool Validate(string username, string password) =>
        string.Equals(username, _testUser.Username, StringComparison.OrdinalIgnoreCase)
        && string.Equals(password, _testUser.Password, StringComparison.Ordinal);
}
