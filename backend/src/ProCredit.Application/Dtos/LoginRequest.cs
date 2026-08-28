using System.ComponentModel.DataAnnotations;

namespace ProCredit.Application.Dtos;

public sealed class LoginRequest
{
    [Required]
    public string Usuario { get; init; } = string.Empty;

    [Required]
    public string Clave { get; init; } = string.Empty;
}
