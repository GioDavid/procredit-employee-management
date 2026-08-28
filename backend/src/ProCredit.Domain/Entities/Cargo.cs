namespace ProCredit.Domain.Entities;

public sealed class Cargo
{
    public int CargoId { get; init; }
    public required string Nombre { get; init; }
}
