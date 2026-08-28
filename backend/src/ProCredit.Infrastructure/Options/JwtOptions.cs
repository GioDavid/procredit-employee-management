namespace ProCredit.Infrastructure.Options;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; init; } = string.Empty;
    public string Audience { get; init; } = string.Empty;
    public string ClaveSecreta { get; init; } = string.Empty;
    public int MinutosExpiracion { get; init; } = 60;
}
