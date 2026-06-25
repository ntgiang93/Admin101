using Core.Application.Abstractions.Persistence;
using Core.Application.Abstractions.Persistence.System;
using Core.Application.Contracts.Base;
using Core.Application.Contracts.System.Role;
using Core.Domain.Entities.System;
using Core.Domain.Security;
using Dapper;
using Dapper.Contrib.Extensions;
using Shared.Common.Extensions;
using SqlKata;

namespace Core.Infrastructure.Persistence.System;

public class RoleRepository : GenericRepository<Role, int>, IRoleRepository
{
    private static readonly Alias<RolePermission> Rp = new ("rp");

    public RoleRepository(IDbConnectionFactory factory) : base(factory)
    {

    }
    
    public async Task<List<RolePermission>> GetRolePermission(int roleId)
    {
        var query = new Query(Rp.Table);
        query = query.Where(Rp.Col(x => x.RoleId), roleId);

        var compiledQuery = _compiler.Compile(query);

        var connection = _dbFactory.Connection;
        var rows = await connection.QueryAsync<RolePermission>(compiledQuery.Sql, compiledQuery.NamedBindings);
        return rows.ToList();
    }

    public async Task<bool> AddRolePermissionAsync(IEnumerable<RolePermission> rolePermissions)
    {
        var cols = new [] {Rp.Col(x => x.RoleId, true), Rp.Col(x => x.SysModule, true), Rp.Col(x => x.Permission, true)};
        var aggregated = rolePermissions
        .GroupBy(x => new { x.RoleId, x.SysModule })
        .Select(g => new object[]
        {
            g.Key.RoleId,
            g.Key.SysModule,
            g.Select(x => x.Permission)
                          .Aggregate(EPermission.None, (acc, cur) => acc | cur)
        })
        .ToList();
        var query = new Query(Rp.RawTable)
            .AsInsert(cols, aggregated);
        var compiledQuery = _compiler.Compile(query);
        var result = _dbFactory.Connection.Execute(compiledQuery.Sql, compiledQuery.NamedBindings);
        return result > 0;
    }

    public async Task<bool> DeleteRolePermissionAsync(int roleId)
    {
        var deleteQuery = new Query(Rp.Table)
            .Where(Rp.Col(x => x.RoleId), roleId)
            .AsDelete();

        var compiled = _compiler.Compile(deleteQuery);

        var connection = _dbFactory.Connection;
        using var transaction = connection.BeginTransaction();
        try
        {
            var rows = await connection.ExecuteAsync(compiled.Sql, compiled.NamedBindings, transaction);
            transaction.Commit();
            return rows > 0;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}