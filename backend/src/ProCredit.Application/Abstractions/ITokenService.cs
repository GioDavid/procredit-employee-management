namespace ProCredit.Application.Abstractions;

public interface ITokenService
{
    (string Token, DateTime ExpiraEn) Generar(string usuario);
}
