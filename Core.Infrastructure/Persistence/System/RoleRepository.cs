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
    private readonly Alias<RolePermission> _rp = new Alias<RolePermission>("rp");
    private readonly Alias<User> _u = new Alias<User>("u");
    private readonly Alias<UserRole> _ur = new Alias<UserRole>("ur");

    public RoleRepository(IDbConnectionFactory factory) : base(factory)
    {

    }

    public async Task<PaginatedResultDto<RoleMembersDto>> GetRoleMembersAsync(GetRoleMembersDto filter)
    {
        var query = new Query(_ur.Table)
            .Join(_u.Table, _ur.Col(x => x.UserId), _u.Col(x => x.Id))
            .Where(_ur.Col(x => x.RoleId), filter.RoleId)
            .Where(_u.Col(x => x.IsDeleted), false)
            .Where(_u.Col(x => x.IsActive), true)
            .Select(_u.Col(x => x.Id), _u.Col(x => x.UserName), _u.Col(x => x.FullName), _u.Col(x => x.Avatar));

        if (!string.IsNullOrEmpty(filter.SearchValue))
        {
            query.Where(q => q.WhereContains($"{_u.Col(x => x.UserName)}", filter.SearchValue)
                .OrWhereContains($"{_u.Col(x => x.FullName)}", filter.SearchValue));
        }

        var connection = _dbFactory.Connection;
        var countQuery = query.Clone().AsCount();
        var compileCountQuery = _compiler.Compile(countQuery);
        var totalCount = await connection.QuerySingleAsync<int>(compileCountQuery.Sql, compileCountQuery.NamedBindings);
        query.OrderByDesc(_u.Col(x => x.CreatedAt))
            .Offset((filter.Page - 1) * filter.PageSize)
            .Limit(filter.PageSize);
        var compileQuery = _compiler.Compile(query);
        var data = await connection.QueryAsync<RoleMembersDto>(compileQuery.Sql, compileQuery.NamedBindings);

        return new PaginatedResultDto<RoleMembersDto>
        {
            Items = data.ToList(),
            TotalCount = totalCount,
            PageIndex = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<List<RolePermission>> GetRolePermission(int roleId)
    {
        var query = new Query(_rp.Table);
        query = query.Where(_rp.Col(x => x.RoleId), roleId);

        var compiledQuery = _compiler.Compile(query);

        var connection = _dbFactory.Connection;
        var rows = await connection.QueryAsync<RolePermission>(compiledQuery.Sql, compiledQuery.NamedBindings);
        return rows.ToList();
    }

    public async Task<bool> AddRolePermissionAsync(IEnumerable<RolePermission> rolePermissions)
    {
        var aggregated = rolePermissions
        .GroupBy(x => new { x.RoleId, x.SysModule })
        .Select(g => new RolePermission
        {
            RoleId = g.Key.RoleId,
            SysModule = g.Key.SysModule,
            Permission = g.Select(x => x.Permission)
                          .Aggregate(EPermission.None, (acc, cur) => acc | cur)
        })
        .ToList();
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            foreach (var rolePermission in aggregated)
            {
                await connection.InsertAsync(rolePermission, transaction);
            }
            return true;
        });
    }

    public async Task<bool> DeleteRolePermissionAsync(int roleId)
    {
        var deleteQuery = new Query(_rp.Table)
            .Where(_rp.Col(x => x.RoleId), roleId)
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