namespace ProCredit.Application.Abstractions;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) Generate(string username);
}
