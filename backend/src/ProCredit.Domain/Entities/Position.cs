namespace ProCredit.Domain.Entities;

public sealed class Position
{
    public int PositionId { get; init; }
    public required string Name { get; init; }
}
