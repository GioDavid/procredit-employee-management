using ProCredit.Application.Abstractions;

namespace ProCredit.Application.Tests.Fakes;

public sealed class FakeTokenService : ITokenService
{
    public string Token { get; set; } = "test-token";

    public DateTime ExpiresAt { get; set; } = new(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc);

    public string? GeneratedUsername { get; private set; }

    public int CallCount { get; private set; }

    public (string Token, DateTime ExpiresAt) Generate(string username)
    {
        CallCount++;
        GeneratedUsername = username;
        return (Token, ExpiresAt);
    }
}
