using Microsoft.Data.SqlClient;

namespace ProCredit.Infrastructure.Persistence;

public interface ISqlConnectionFactory
{
    SqlConnection Crear();
}

public sealed class SqlConnectionFactory(string connectionString) : ISqlConnectionFactory
{
    public SqlConnection Crear() => new(connectionString);
}
