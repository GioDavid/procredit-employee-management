namespace ProCredit.Application.Abstractions;

public interface IUsuarioAutenticador
{
    bool Validar(string usuario, string clave);
}
