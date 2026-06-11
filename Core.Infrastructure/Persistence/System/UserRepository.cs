using Core.Application.Abstractions.Persistence;
using Core.Application.Abstractions.Persistence.System;
using Core.Application.Common;
using Core.Application.Contracts.System.Role;
using Core.Application.Contracts.System.User;
using Core.Domain.Entities.System;
using Dapper;
using Shared.Common.Extensions;
using SqlKata;

namespace Core.Infrastructure.Persistence.System;

public class UserRepository : GenericRepository<User, string>, IUserRepository
{
    private static readonly Alias<User> u = new Alias<User>("u");
    private static readonly Alias<UserRole> ur = new Alias<UserRole>("ur");
    private static readonly Alias<Role> r = new Alias<Role>("r");

    public UserRepository(IDbConnectionFactory factory) : base(factory)
    {

    }

    public async Task<List<RoleClaimDto>> GetRolesAsync(string userId)
    {
        var query = new Query(u.Table);
        query.Join(ur.Table, u.Col(x => x.Id), ur.Col(x => x.UserId))
             .Join(r.Table, ur.Col(x => x.RoleId), r.Col(x => x.Id))
             .Where(u.Col(x => x.Id), userId)
             .Where(u.Col(x => x.IsDeleted), false)
             .Where(u.Col(x => x.IsActive), true)
             .Where(r.Col(x => x.IsDeleted), false)
             .Select([r.Col(x => x.Code), r.Col(x => x.Id)]);

        var compiledQuery = _compiler.Compile(query);

        using var connection = _dbFactory.Connection;
        var result = await connection.QueryAsync<RoleClaimDto>(compiledQuery.Sql, compiledQuery.NamedBindings);
        return result.ToList();
    }

    public async Task<UserDto?> GetDetailAsync(string userId)
    {
        // Get user details
        var userQuery = new Query(u.Table)
            .Where(u.Col(x => x.Id), userId)
            .Where(u.Col(x => x.IsDeleted), false);

        var userSql = _compiler.Compile(userQuery);
        using var connection = _dbFactory.Connection;
        var user = await connection.QueryFirstOrDefaultAsync<User>(userSql.Sql, userSql.NamedBindings);

        if (user == null) return null;

        // Get user roles
        var roleQuery = new Query(ur.Table)
            .Join(r.Table, ur.Col(x => x.RoleId), r.Col(x => x.Id))
            .Where(ur.Col(x => x.UserId), user.Id)
            .Where(r.Col(x => x.IsDeleted), false)
            .Select(r.Col(x => x.Name), r.Col(x => x.Id));

        var roleSql = _compiler.Compile(roleQuery);
        var roleData = await connection.QueryAsync<(string Name, int Id)>(roleSql.Sql, roleSql.NamedBindings);

        return new UserDto
        {
            Id = user.Id.ToString(),
            UserName = user.UserName,
            Avatar = user.Avatar,
            Email = user.Email,
            Phone = user.Phone,
            FullName = user.FullName,
            IsActive = user.IsActive,
            TwoFa = user.TwoFa,
            isLocked = user.IsLocked,
            LockExprires = user.LockExprires,
            Roles = roleData.Select(r => r.Id).ToList(),
            RolesName = roleData.Select(r => r.Name).ToList()
        };
    }

    public async Task<User?> FindLastUserByUserNamePrefixAsync(string prefix)
    {
        if (string.IsNullOrEmpty(prefix)) return null;

        var query = new Query(u.Table)
            .Where(u.Col(x => x.IsDeleted), false)
            .Where(u.Col(x => x.IsActive), true)
            .WhereRaw($"{u.Col(x => x.UserName)} LIKE ?", prefix + "%")
            .WhereRaw($"LEN({u.Col(x => x.UserName)}) = ?", prefix.Length + 3)
            .OrderByDesc(u.Col(x => x.UserName))
            .Limit(1);

        var compiledQuery = _compiler.Compile(query);

        using var connection = _dbFactory.Connection;
        var result = await connection.QueryFirstOrDefaultAsync<User>(compiledQuery.Sql, compiledQuery.NamedBindings);

        return result;
    }

    public async Task<(List<UserTableDto> Items, int TotalCount)> GetPaginatedUsersAsync(UserTableRequestDto request)
    {
        Query query;
        query = new Query(u.Table)
                .LeftJoin(ur.Table, u.Col(x => x.Id), ur.Col(x => x.UserId))
                .LeftJoin(r.Table, ur.Col(x => x.RoleId), r.Col(x => x.Id))
                .Where(u.Col(x => x.IsDeleted), false);

        // Apply search filter
        if (!string.IsNullOrEmpty(request.SearchValue))
        {
            query.Where(q => q
                .WhereLike(u.Col(x => x.UserName), $"{request.SearchValue}")
                .OrWhereLike(u.Col(x => x.Email), $"{request.SearchValue}")
                .OrWhereLike(u.Col(x => x.FullName), $"{request.SearchValue}"));
        }

        // Filter by active status
        if (request.IsActive.HasValue)
        {
            query.Where(u.Col(x => x.IsActive), request.IsActive.Value);
        }

        // Filter by locked status
        if (request.isLocked.HasValue)
        {
            if (request.isLocked.Value)
                query.WhereNotNull(u.Col(x => x.LockExprires));
            else
                query.WhereNull(u.Col(x => x.LockExprires));
        }
        // Select with string aggregation for roles
        query.Select(u.Col(x => x.Id),
                     u.Col(x => x.UserName),
                     u.Col(x => x.Email),
                     u.Col(x => x.FullName),
                     u.Col(x => x.Phone),
                     u.Col(x => x.Avatar),
                     u.Col(x => x.IsActive),
                     u.Col(x => x.IsLocked))
             .SelectRaw($"STRING_AGG(r.{nameof(Role.Name)}, ',') as RolesString")
             .GroupBy(u.Col(x => x.Id),
                      u.Col(x => x.UserName),
                      u.Col(x => x.Email),
                      u.Col(x => x.FullName),
                      u.Col(x => x.Phone),
                      u.Col(x => x.Avatar),
                      u.Col(x => x.IsActive),
                      u.Col(x => x.IsLocked));
        // Count number user
        using var connection = _dbFactory.Connection;
        var countQuery = query.Clone().AsCount([$"u.{nameof(User.Id)}"]);
        var compiledCountQuery = _compiler.Compile(countQuery);
        var total = await connection.QuerySingleAsync<int>(compiledCountQuery.Sql, compiledCountQuery.NamedBindings);

        // Apply pagination and ordering
        query.OrderBy($"u.{nameof(User.UserName)}")
             .Offset((request.Page - 1) * request.PageSize)
             .Limit(request.PageSize);

        var compiledQuery = _compiler.Compile(query);
        var users = await connection.QueryAsync<UserTableDto>(compiledQuery.Sql, compiledQuery.NamedBindings);

        // Convert to final result format
        var result = users.Select(u => new UserTableDto
        {
            Id = u.Id,
            UserName = u.UserName,
            Email = u.Email,
            FullName = u.FullName,
            Phone = u.Phone,
            Avatar = u.Avatar,
            IsActive = u.IsActive,
            isLocked = u.isLocked,
            Roles = string.IsNullOrEmpty(u.RolesString)
                ? new List<string>()
                : u.RolesString.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
        }).ToList();

        return (result, total); // Return 0 for total count as requested
    }

    public async Task<(List<UserSelectDto> Items, int TotalCount)> GetPaginatedUser2SelectAsync(PaginationRequest request)
    {
        // Base query for active, non-deleted users
        var query = new Query(u.Table)
            .Where(u.Col(x => x.IsDeleted), false)
            .Where(u.Col(x => x.IsActive), true);

        // Apply search filter
        if (!string.IsNullOrEmpty(request.SearchValue))
        {
            query.Where(q => q
                .WhereLike(u.Col(x => x.UserName), $"%{request.SearchValue}%")
                .OrWhereLike(u.Col(x => x.Email), $"%{request.SearchValue}%")
                .OrWhereLike(u.Col(x => x.FullName), $"%{request.SearchValue}%"));
        }

        using var connection = _dbFactory.Connection;

        // Get total count
        var countQuery = query.Clone().AsCount();
        var countCompiled = _compiler.Compile(countQuery);
        var totalCount = await connection.QuerySingleAsync<int>(countCompiled.Sql, countCompiled.NamedBindings);

        // Get paginated results
        var selectQuery = query.Clone()
            .Select(u.Col(x => x.Id),
                    u.Col(x => x.UserName),
                    u.Col(x => x.Email),
                    u.Col(x => x.FullName),
                    u.Col(x => x.Avatar))
             .OrderBy(u.Col(x => x.UserName))
             .Offset((request.Page - 1) * request.PageSize)
             .Limit(request.PageSize);

        var selectCompiled = _compiler.Compile(selectQuery);
        var users = await connection.QueryAsync<User>(selectCompiled.Sql, selectCompiled.NamedBindings);

        var result = users.Select(user => new UserSelectDto
        {
            Id = user.Id.ToString(),
            UserName = user.UserName,
            Email = user.Email,
            FullName = user.FullName,
            Avatar = user.Avatar,
        }).ToList();

        return (result, totalCount);
    }
}