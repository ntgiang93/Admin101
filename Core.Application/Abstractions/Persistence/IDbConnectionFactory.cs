using System.Data;

namespace Core.Application.Abstractions.Persistence;

public interface IDbConnectionFactory : IDisposable
{
    IDbConnection Connection { get; }
    string MainDbType { get; }
}