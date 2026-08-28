namespace ProCredit.Application.Exceptions;

/// <summary>Violacion de una regla de negocio; se traduce a 400 en la capa Api.</summary>
public class ReglaNegocioException(string message) : Exception(message);

/// <summary>Conflicto con un recurso existente; se traduce a 409 en la capa Api.</summary>
public sealed class ConflictoException(string message) : ReglaNegocioException(message);
