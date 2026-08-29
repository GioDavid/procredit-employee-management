namespace ProCredit.Application.Dtos;

public sealed record LoginResponse(string Token, DateTime ExpiresAt);
