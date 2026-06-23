using System.Data;
using System.Linq.Expressions;
using System.Reflection;
using Core.Application.Abstractions.Persistence;
using Core.Domain.Constants;
using Core.Domain.Entities;
using Dapper;
using Dapper.Contrib.Extensions;
using Mapster;
using Shared.Common.Extensions;
using SqlKata;
using SqlKata.Compilers;
using SqlKata.Execution;

namespace Core.Infrastructure.Persistence;

public class GenericRepository<TEntity, TKey> : IGenericRepository<TEntity, TKey>
    where TEntity : BaseEntity<TKey>
{
    protected readonly IDbConnectionFactory _dbFactory;
    protected readonly Compiler _compiler;
    private readonly string _databaseType;
    private static readonly Alias<TEntity> _alias = new Alias<TEntity>("t");

    public GenericRepository(IDbConnectionFactory dbFactory)
    {
        _dbFactory = dbFactory;
        _databaseType = dbFactory.MainDbType;
        _compiler = _databaseType == DataBaseType.Postgres ? new PostgresCompiler() : new SqlServerCompiler();

    }

    public virtual async Task<TDto> GetByIdAsync<TDto>(TKey id)
    {
        var entity = await _dbFactory.Connection.GetAsync<TEntity>(id);
        return entity.Adapt<TDto>();
    }

    public virtual async Task<TDto> GetSingleAsync<TDto>(Expression<Func<TEntity, bool>> predicate)
    {
        var alias = new Alias<TEntity>("t");
        var query = new Query(_alias.Table);
        query = ApplyPredicate(query, alias, predicate);
        var compiled = _compiler.Compile(query);
        var entity = await _dbFactory.Connection.QueryFirstOrDefaultAsync<TEntity>(compiled.Sql, compiled.NamedBindings);
        return entity.Adapt<TDto>();
    }

    public virtual async Task<IEnumerable<TDto>> GetAllAsync<TDto>()
    {
        var entities = await _dbFactory.Connection.GetAllAsync<TEntity>();
        return entities.Adapt<IEnumerable<TDto>>();
    }

    public virtual async Task<IEnumerable<TDto>> FindAsync<TDto>(Expression<Func<TEntity, bool>> predicate)
    {
        var alias = new Alias<TEntity>("t");
        var query = new Query(alias.Table);
        query = ApplyPredicate(query, alias, predicate);
        var compiled = _compiler.Compile(query);
        var entities = await _dbFactory.Connection.QueryAsync<TEntity>(compiled.Sql, compiled.NamedBindings);
        return entities.Adapt<IEnumerable<TDto>>();
    }

    public virtual async Task<TKey> InsertAsync(TEntity entity)
    {
        var db = new QueryFactory(_dbFactory.Connection, _compiler);
        entity.CreatedAt = DateTime.Now;
        entity.IsDeleted = false;
        if (typeof(TKey) == typeof(string))
        {
            if (string.IsNullOrEmpty(entity.Id?.ToString()))
            {
                entity.Id = (TKey)(object)Ulid.NewUlid().ToString();
            }
            var data = entity.ToDictionary();
            await db.Query(_alias.RawTable).InsertAsync(data);
            return entity.Id;
        }
        else
        {
            var data = entity.ToDictionary([nameof(BaseEntity<TKey>.Id)]);
            var id = await db.Query(_alias.RawTable).InsertGetIdAsync<TKey>(data);
            return id;
        }
    }
    
    public virtual async Task<bool> UpdateAsync(TEntity entity)
    {
        var db = new QueryFactory(_dbFactory.Connection, _compiler);
        entity.UpdatedAt = DateTime.Now;
        var data = entity.ToDictionary([
            nameof(BaseEntity<TKey>.Id),
            nameof(BaseEntity<TKey>.CreatedAt),
            nameof(BaseEntity<TKey>.CreatedBy)]);
        var result = await db.Query(_alias.Table).Where(_alias.Col(a => a.Id), entity.Id).UpdateAsync(data);
        return result > 0;
    }

    public virtual async Task<bool> DeleteAsync(TEntity entity)
    {
        var db = new QueryFactory(_dbFactory.Connection, _compiler);
        var result = await db.Query(_alias.RawTable).DeleteAsync();
        return result > 0;
    }

    public async Task<IEnumerable<T>> ExecuteSPAsync<T>(string storedProcedure, DynamicParameters? parameters = null)
    {
        return await _dbFactory.Connection.QueryAsync<T>(storedProcedure, parameters, commandType: CommandType.StoredProcedure);
    }

    public async Task<T?> ExecuteSPSingleAsync<T>(string storedProcedure, DynamicParameters? parameters = null)
    {
        return await _dbFactory.Connection.QueryFirstOrDefaultAsync<T>(storedProcedure, parameters,
            commandType: CommandType.StoredProcedure);
    }

    public async Task<(IEnumerable<T> Items, int TotalCount)> ExecuteSPWithPaginationAsync<T>(
        string storedProcedure,
        DynamicParameters? parameters = null,
        int pageIndex = 1,
        int pageSize = 10)
    {
        var result = await _dbFactory.Connection.QueryMultipleAsync(storedProcedure, parameters, commandType: CommandType.StoredProcedure);
        var items = await result.ReadAsync<T>();
        var totalCount = await result.ReadSingleAsync<int>();

        return (items, totalCount);
    }

    // Transaction support methods
    protected async Task<T> ExecuteInTransactionAsync<T>(Func<IDbConnection, IDbTransaction, Task<T>> operation)
    {
        using var transaction = _dbFactory.Connection.BeginTransaction();

        try
        {
            var result = await operation(_dbFactory.Connection, transaction);
            transaction.Commit();
            return result;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    protected async Task ExecuteInTransactionAsync(Func<IDbConnection, IDbTransaction, Task> operation)
    {
        using var transaction = _dbFactory.Connection.BeginTransaction();

        try
        {
            await operation(_dbFactory.Connection, transaction);
            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    // Helper method to map to the database column name for a given property following the convention of snake_case for PostgreSQL and PascalCase for SQL Server
    protected string GetColumn(Expression<Func<TEntity, object>> expression)
    {
        var member = expression.Body as MemberExpression;

        if (member == null &&
            expression.Body is UnaryExpression unary)
        {
            member = unary.Operand as MemberExpression;
        }

        var property = member!.Member as PropertyInfo;

        var columnAttr =
            property?.GetCustomAttribute<ColumnAttribute>();

        return columnAttr?.Name ?? property!.Name;

    }

    private Query ApplyPredicate(
    Query query,
    Alias<TEntity> alias,
    Expression<Func<TEntity, bool>> expression)
    {
        if (expression.Body is BinaryExpression binary)
        {
            switch (binary.NodeType)
            {
                case ExpressionType.AndAlso:
                    query.Where(q => ApplyPredicate(q, alias, Expression.Lambda<Func<TEntity, bool>>(binary.Left, expression.Parameters)))
                        .Where(q => ApplyPredicate(q, alias, Expression.Lambda<Func<TEntity, bool>>(binary.Right, expression.Parameters)));
                    break;
                case ExpressionType.OrElse:
                    query.Where(q => ApplyPredicate(q, alias, Expression.Lambda<Func<TEntity, bool>>(binary.Left, expression.Parameters)))
                         .OrWhere(q => ApplyPredicate(q, alias, Expression.Lambda<Func<TEntity, bool>>(binary.Right, expression.Parameters)));
                    break;
                case ExpressionType.Equal:
                    query.Where(alias.Col(binary.Left), GetExpressionValue(binary.Right));
                    break;

                case ExpressionType.NotEqual:
                    query.WhereNot(alias.Col(binary.Left), GetExpressionValue(binary.Right));
                    break;
                case ExpressionType.GreaterThan:
                    query.Where(alias.Col(binary.Left), ">", GetExpressionValue(binary.Right));
                    break;
                case ExpressionType.GreaterThanOrEqual:
                    query.Where(alias.Col(binary.Left), ">=", GetExpressionValue(binary.Right));
                    break;
                case ExpressionType.LessThan:
                    query.Where(alias.Col(binary.Left), "<", GetExpressionValue(binary.Right));
                    break;
                case ExpressionType.LessThanOrEqual:
                    query.Where(alias.Col(binary.Left), "<=", GetExpressionValue(binary.Right));
                    break;
            }
        }

        return query;
    }

    private object? GetExpressionValue(Expression expression)
    {
        switch (expression)
        {
            case ConstantExpression constant:
                return constant.Value;

            case MemberExpression member:
                var objectMember =
                    Expression.Convert(member, typeof(object));

                return Expression
                    .Lambda<Func<object>>(objectMember)
                    .Compile()();

            default:
                return Expression
                    .Lambda(expression)
                    .Compile()
                    .DynamicInvoke();
        }
        throw new NotSupportedException($"Expression type {expression.GetType().Name} is not supported.");
    }
}