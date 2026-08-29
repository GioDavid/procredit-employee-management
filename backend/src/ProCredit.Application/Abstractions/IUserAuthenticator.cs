namespace ProCredit.Application.Abstractions;

public interface IUserAuthenticator
{
    bool Validate(string username, string password);
}
