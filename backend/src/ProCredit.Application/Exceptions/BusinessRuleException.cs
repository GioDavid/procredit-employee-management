namespace ProCredit.Application.Exceptions;

/// <summary>Business-rule violation; mapped to 400 in the Api layer.</summary>
public class BusinessRuleException(string message) : Exception(message);

/// <summary>Conflict with an existing resource; mapped to 409 in the Api layer.</summary>
public sealed class ConflictException(string message) : BusinessRuleException(message);
