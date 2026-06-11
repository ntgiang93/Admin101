using System.Data;
using Core.Application.Abstractions.Persistence;
using Core.Domain.Constants;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace Core.Infrastructure.Persistence;

public class DbConnectionFactory : IDbConnectionFactory
{
    private readonly string _mainConnectionString;
    private IDbConnection? _connection;
    // The name of the connection string in appsettings.json or other configuration source.
    // You can change this if you want to use a different connection string name.
    // _dnName need to match the key used in your configuration for the connection string, e.g. "ConnectionStrings:Postgres" or "Postgres", and also match the constant defined in DataBaseType class.
    private readonly string _dbName = DataBaseType.Postgres;

    public DbConnectionFactory(IConfiguration configuration)
    {
        _mainConnectionString = configuration.GetConnectionString(_dbName)
            ?? configuration[$"ConnectionStrings:{_dbName}"]
            ?? throw new InvalidOperationException($"Connection string '{_dbName}' is not configured.");
    }

    public IDbConnection Connection
    {
        get
        {
            if (_connection == null || _connection.State == ConnectionState.Closed)
            {
                // user SqlConnection for SQL Server, NpgsqlConnection for PostgreSQL, etc. depending on your database provider
                //_connection = new SqlConnection(_mainConnectionString);
                _connection = new NpgsqlConnection(_mainConnectionString);
                _connection.Open();
            }

            return _connection;
        }
    }

    public string MainDbType => _dbName;

    public void Dispose()
    {
        _connection?.Dispose();
    }
}