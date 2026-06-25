using System.Text;
using Core.Application.Abstractions.Persistence;
using Core.Application.Abstractions.Persistence.System;
using Core.Application.Contracts.Base;
using Core.Application.Contracts.System.Role;
using Core.Application.Contracts.System.User;
using Core.Domain.Entities.System;
using Dapper;
using Dapper.Contrib.Extensions;
using Shared.Common.Extensions;
using SqlKata;

namespace Core.Infrastructure.Persistence.System;

public class UserRoleRepository : GenericRepository<User, string>, IUserRoleRepository
{
    private static readonly Alias<Role> R = new ("r");
    private static readonly Alias<User> U = new ("u");
    private static readonly Alias<UserRole> Ur = new ("ur");

    public UserRoleRepository(IDbConnectionFactory factory) : base(factory)
    {
        
    }

    public async Task<List<UserRole>> GetAllByUserAsync(string userId)
    {
        var query = new Query(Ur.Table)
            .Where(Ur.Col(x => x.UserId), userId);

        var compiledQuery = _compiler.Compile(query);
        using var connection = _dbFactory.Connection;

        var result = await connection.QueryAsync<UserRole>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }

    public async Task<List<UserRole>> GetAllByRoleAsync(int roleId)
    {
        var query = new Query(Ur.Table)
            .Where(Ur.Col(x => x.RoleId), roleId);

        var compiledQuery = _compiler.Compile(query);
        using var connection = _dbFactory.Connection;
        var result = await connection.QueryAsync<UserRole>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }

    public async Task<bool> AddUserRoleAsync(IEnumerable<UserRole> userRoles)
    {
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            foreach (var userRole in userRoles)
            {
                await connection.InsertAsync(userRole, transaction);
            }
            return true;
        });
    }

    public async Task<bool> DeleteUserRoleAsync(IEnumerable<UserRole> userRoles)
    {
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            foreach (var userRole in userRoles)
            {
                await connection.DeleteAsync(userRole, transaction);
            }
            return true;
        });
    }

    public async Task<UserRole?> GetSingleAsync(int roleId, string userId)
    {
        var query = new Query(Ur.Table)
            .Where(nameof(UserRole.RoleId), roleId)
            .Where(nameof(UserRole.UserId), userId);

        var compiledQuery = _compiler.Compile(query);
        using var connection = _dbFactory.Connection;
        var result = await connection.QueryFirstOrDefaultAsync<UserRole>(compiledQuery.Sql, compiledQuery.NamedBindings);

        return result;
    }

    public async Task<bool> DeleteAsync(int roleId, string userId)
    {
        var query = new Query(Ur.Table)
            .Where(nameof(UserRole.RoleId), roleId)
            .Where(nameof(UserRole.UserId), userId);

        var compiledQuery = _compiler.Compile(query);
        using var connection = _dbFactory.Connection;
        var result = await connection.QueryFirstOrDefaultAsync<UserRole>(compiledQuery.Sql, compiledQuery.NamedBindings);
        if (result is null) return true;
        return await connection.DeleteAsync(result);
    }

    public async Task<bool> AddMemberAsync(AddMemberRoleDto dto, string createdBy)
    {
        var cols = new[]
        {
            Ur.Col(x => x.UserId,true),
            Ur.Col(x => x.RoleId, true),
        };

        var data = dto.UserIds.Select(userId => new object[] { userId, dto.RoleId }).ToList();
        var query = new Query(Ur.RawTable)
            .AsInsert(cols, data);
        var compiledQuery = _compiler.Compile(query);
        using var connection = _dbFactory.Connection;
        using var transaction = connection.BeginTransaction();
        try
        {
            await connection.ExecuteAsync(compiledQuery.Sql, compiledQuery.NamedBindings, transaction);

            transaction.Commit();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception in AddMemberAsync: {ex}");
            transaction.Rollback();
            return false;
        }
    }

    public async Task<bool> RemoveMemberAsync(int roleId, List<string> userIds)
    {
        var query = new Query(Ur.Table)
            .Where(Ur.Col(x => x.RoleId), roleId)
            .WhereIn(Ur.Col(x => x.UserId), userIds)
            .AsDelete();

        var compiledQuery = _compiler.Compile(query);

        using var connection = _dbFactory.Connection;
        using var transaction = connection.BeginTransaction();
        try
        {
            await connection.ExecuteAsync(compiledQuery.Sql, compiledQuery.NamedBindings, transaction);

            transaction.Commit();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception in RemoveMemberAsync: {ex}");
            transaction.Rollback();
            return false;
        }
    }

    public async Task<CursorPaginatedResultDto<UserSelectDto, DateTime>> GetUserNotInRole(
        UserRoleCursorFilterDto filter)
    {
        // Query users NOT EXISTS in UserRole for the specified roleId
        var query = new Query(U.Table)
            .Select(new[]
            {
                U.Col(x => x.Id),
                U.Col(x => x.FullName),
                U.Col(x => x.UserName),
                U.Col(x => x.Avatar),
                U.Col(x => x.CreatedAt)
            })
            .WhereFalse(U.Col(x => x.IsDeleted))
            .WhereTrue(U.Col(x => x.IsActive))
            .WhereNotExists(q => q
                .From(Ur.Table)
                .WhereColumns(Ur.Col(x => x.UserId), "=",U.Col(x => x.Id))
                .Where(Ur.Col(x => x.RoleId), filter.RoleId)
            );

        // Optional search
        if (!string.IsNullOrWhiteSpace(filter.SearchValue))
        {
            query.Where(q => q
                .WhereContains(U.Col(x => x.FullName), filter.SearchValue)
                .OrWhereContains(U.Col(x => x.UserName), filter.SearchValue)
            );
        }

        // Keyset pagination on User.CreatedAt
        if (filter.Cursor.HasValue)
        {
            query.Where( U.Col(x => x.CreatedAt), "<", filter.Cursor.Value);
        }

        query.OrderByDesc(U.Col(x => x.CreatedAt))
            .Limit(filter.Limit + 1); // fetch one extra to know if there is more
        var compiled = _compiler.Compile(query);
        using var connection = _dbFactory.Connection;
        var rows = (await connection.QueryAsync<UserSelectDto>(compiled.Sql, compiled.NamedBindings)).ToList();

        var hasMore = rows.Count > filter.Limit;
        if (hasMore)
        {
            rows = rows.Take(filter.Limit).ToList();
        }

        var nextCursor = rows.Count > 0 ? rows[^1].CreatedAt : default(DateTime);

        return new CursorPaginatedResultDto<UserSelectDto, DateTime>
        {
            Items = rows,
            NextCursor = hasMore ? nextCursor : default,
            HasMore = hasMore
        };
    }
    public async Task<CursorPaginatedResultDto<UserSelectDto, DateTime>> GetRoleMembersAsync(UserRoleCursorFilterDto filter)
    {
        var query = new Query(Ur.Table)
            .Join(U.Table, Ur.Col(x => x.UserId), U.Col(x => x.Id))
            .Where(Ur.Col(x => x.RoleId), filter.RoleId)
            .Where(U.Col(x => x.IsDeleted), false)
            .Where(U.Col(x => x.IsActive), true)
            .Select(U.Col(x => x.Id), U.Col(x => x.UserName), U.Col(x => x.FullName), U.Col(x => x.Avatar));

        if (!string.IsNullOrEmpty(filter.SearchValue))
        {
            query.Where(q => q.WhereContains($"{U.Col(x => x.UserName)}", filter.SearchValue)
                .OrWhereContains($"{U.Col(x => x.FullName)}", filter.SearchValue));
        }
        
        // Keyset pagination on User.CreatedAt
        if (filter.Cursor.HasValue)
        {
            query.Where( U.Col(x => x.CreatedAt), "<", filter.Cursor.Value);
        }

        query.OrderByDesc(U.Col(x => x.CreatedAt))
            .Limit(filter.Limit + 1); // fetch one extra to know if there is more
        var compiled = _compiler.Compile(query);
        using var connection = _dbFactory.Connection;
        var rows = (await connection.QueryAsync<UserSelectDto>(compiled.Sql, compiled.NamedBindings)).ToList();

        var hasMore = rows.Count > filter.Limit;
        if (hasMore)
        {
            rows = rows.Take(filter.Limit).ToList();
        }

        var nextCursor = rows.Count > 0 ? rows[^1].CreatedAt : default(DateTime);

        return new CursorPaginatedResultDto<UserSelectDto, DateTime>
        {
            Items = rows,
            NextCursor = hasMore ? nextCursor : default,
            HasMore = hasMore
        };
    }

}