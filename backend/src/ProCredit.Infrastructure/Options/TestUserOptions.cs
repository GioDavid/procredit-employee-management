namespace ProCredit.Infrastructure.Options;

/// <summary>Preconfigured test user (appsettings); there is no users table.</summary>
public sealed class TestUserOptions
{
    public const string SectionName = "TestUser";

    public string Username { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
}
