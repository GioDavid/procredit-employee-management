namespace ProCredit.Domain.Entities;

public sealed class Empleado
{
    public int EmpleadoId { get; init; }
    public required string NumeroDocumento { get; init; }
    public required string Nombres { get; init; }
    public required string Apellidos { get; init; }
    public int Edad { get; init; }
    public decimal RemuneracionMensual { get; init; }
    public int DepartamentoId { get; init; }
    public required string Departamento { get; init; }
    public int CargoId { get; init; }
    public required string Cargo { get; init; }
}
