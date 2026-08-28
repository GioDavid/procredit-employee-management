namespace ProCredit.Infrastructure.Options;

/// <summary>Usuario de prueba preconfigurado (appsettings), sin tabla de usuarios.</summary>
public sealed class UsuarioPruebaOptions
{
    public const string SectionName = "UsuarioPrueba";

    public string Usuario { get; init; } = string.Empty;
    public string Clave { get; init; } = string.Empty;
}
