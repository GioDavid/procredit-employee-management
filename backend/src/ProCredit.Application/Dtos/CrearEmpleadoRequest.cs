using System.ComponentModel.DataAnnotations;

namespace ProCredit.Application.Dtos;

public sealed class CrearEmpleadoRequest
{
    [Required, StringLength(20, MinimumLength = 6)]
    public string NumeroDocumento { get; init; } = string.Empty;

    [Required, StringLength(100)]
    public string Nombres { get; init; } = string.Empty;

    [Required, StringLength(100)]
    public string Apellidos { get; init; } = string.Empty;

    [Range(18, 100)]
    public int Edad { get; init; }

    [Range(0.01, 9999999999999999.99)]
    public decimal RemuneracionMensual { get; init; }

    [Range(1, int.MaxValue)]
    public int DepartamentoId { get; init; }

    [Range(1, int.MaxValue)]
    public int CargoId { get; init; }
}
