using Microsoft.Data.SqlClient;

namespace ProCredit.Infrastructure.Persistence;

public interface ISqlConnectionFactory
{
    SqlConnection Create();
}

public sealed class SqlConnectionFactory(string connectionString) : ISqlConnectionFactory
{
    public SqlConnection Create() => new(connectionString);
}
