using Core.Application.Abstractions.Persistence;
using Core.Application.Abstractions.Persistence.System;
using Core.Application.Common;
using Core.Application.Contracts.System.Role;
using Core.Application.Contracts.System.User;
using Core.Domain.Entities.Organization;
using Core.Domain.Entities.System;
using Dapper;
using Shared.Common.Extensions;
using SqlKata;

namespace Core.Infrastructure.Persistence.System;

public class UserRepository : GenericRepository<User, string>, IUserRepository
{
    private static readonly Alias<User> U = new Alias<User>("u");
    private static readonly Alias<UserRole> Ur = new Alias<UserRole>("ur");
    private static readonly Alias<Role> R = new Alias<Role>("r");
    private static readonly Alias<UserDepartment> Ud = new Alias<UserDepartment>("ud");
    private static readonly Alias<Department> D = new Alias<Department>("d");
    private static readonly Alias<UserToken> Ut = new Alias<UserToken>("ut");

    public UserRepository(IDbConnectionFactory factory) : base(factory)
    {
    }

    public async Task<List<RoleClaimDto>> GetRolesAsync(string userId)
    {
        var query = new Query(U.Table);
        query.Join(Ur.Table, U.Col(x => x.Id), Ur.Col(x => x.UserId))
            .Join(R.Table, Ur.Col(x => x.RoleId), R.Col(x => x.Id))
            .Where(U.Col(x => x.Id), userId)
            .Where(U.Col(x => x.IsDeleted), false)
            .Where(U.Col(x => x.IsActive), true)
            .Where(R.Col(x => x.IsDeleted), false)
            .Select([R.Col(x => x.Code), R.Col(x => x.Id)]);

        var compiledQuery = _compiler.Compile(query);

        using var connection = _dbFactory.Connection;
        var result = await connection.QueryAsync<RoleClaimDto>(compiledQuery.Sql, compiledQuery.NamedBindings);
        return result.ToList();
    }

    public async Task<UserDto?> GetDetailAsync(string userId)
    {
        // Get user details
        var userQuery = new Query(U.Table)
            .Where(U.Col(x => x.Id), userId)
            .Where(U.Col(x => x.IsDeleted), false);

        var userSql = _compiler.Compile(userQuery);
        using var connection = _dbFactory.Connection;
        var user = await connection.QueryFirstOrDefaultAsync<User>(userSql.Sql, userSql.NamedBindings);

        if (user == null) return null;

        // Get user roles
        var roleQuery = new Query(Ur.Table)
            .Join(R.Table, Ur.Col(x => x.RoleId), R.Col(x => x.Id))
            .Where(Ur.Col(x => x.UserId), user.Id)
            .Where(R.Col(x => x.IsDeleted), false)
            .Select(R.Col(x => x.Name), R.Col(x => x.Id));

        var roleSql = _compiler.Compile(roleQuery);
        var roleData = await connection.QueryAsync<(string Name, int Id)>(roleSql.Sql, roleSql.NamedBindings);

        var valueTuples = roleData.ToList();
        return new UserDto
        {
            Id = user.Id.ToString(),
            UserName = user.UserName,
            Avatar = user.Avatar ?? "",
            Email = user.Email,
            Phone = user.Phone ?? "",
            FullName = user.FullName,
            IsActive = user.IsActive,
            TwoFa = user.TwoFa,
            isLocked = user.IsLocked,
            LockExprires = user.LockExprires,
            Roles = valueTuples.Select(r => r.Id).ToList(),
            RolesName = valueTuples.Select(r => r.Name).ToList()
        };
    }

    public async Task<User?> FindLastUserByUserNamePrefixAsync(string prefix)
    {
        if (string.IsNullOrEmpty(prefix)) return null;

        var query = new Query(U.Table)
            .Where(U.Col(x => x.IsDeleted), false)
            .Where(U.Col(x => x.IsActive), true)
            .WhereRaw($"{U.Col(x => x.UserName)} LIKE ?", prefix + "%")
            .WhereRaw($"LEN({U.Col(x => x.UserName)}) = ?", prefix.Length + 3)
            .OrderByDesc(U.Col(x => x.UserName))
            .Limit(1);

        var compiledQuery = _compiler.Compile(query);

        using var connection = _dbFactory.Connection;
        var result = await connection.QueryFirstOrDefaultAsync<User>(compiledQuery.Sql, compiledQuery.NamedBindings);

        return result;
    }

    public async Task<(List<UserTableDto> Items, int TotalCount)> GetPaginatedUsersAsync(UserTableRequestDto request)
    {
        var query = new Query(U.Table)
            .LeftJoin(Ur.Table, U.Col(x => x.Id), Ur.Col(x => x.UserId))
            .LeftJoin(R.Table, Ur.Col(x => x.RoleId), R.Col(x => x.Id))
            .LeftJoin(Ud.Table, j => j
                .On(U.Col(u => u.Id), Ud.Col(ud => ud.UserId))
                .WhereTrue(Ud.Col(ud => ud.IsPrimary))
            )
            .LeftJoin(D.Table, Ud.Col(ud => ud.DepartmentId), D.Col(d => d.Id))
            .LeftJoin(Ut.Table, Ut.Col(ut => ut.UserId), U.Col(u => u.Id))
            .WhereFalse(U.Col(x => x.IsDeleted));

        // Filter by active status
        if (request.IsActive.HasValue)
        {
            query.Where(U.Col(x => x.IsActive), request.IsActive.Value);
        }

        // Filter by locked status
        if (request.IsLocked.HasValue)
        {
            if (request.IsLocked.Value)
                query.WhereNotNull(U.Col(x => x.LockExprires));
            else
                query.WhereNull(U.Col(x => x.LockExprires));
        }

        if (request.Roles.Any())
        {
            query.WhereIn(R.Col(x => x.Id), request.Roles);
        }

        if (request.Departments.Any())
        {
            query.WhereIn(Ud.Col(x => x.DepartmentId), request.Departments);
        }

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(request.SearchValue))
        {
            query.Where(q => q
                .WhereLike(U.Col(x => x.UserName), $"{request.SearchValue}%")
                .OrWhereLike(U.Col(x => x.Email), $"{request.SearchValue}%")
                .OrWhereLike(U.Col(x => x.FullName), $"%{request.SearchValue}%")
            );
        }

        // Select with string aggregation for roles
        query.Select(U.Col(x => x.Id),
                U.Col(x => x.UserName),
                U.Col(x => x.Email),
                U.Col(x => x.FullName),
                U.Col(x => x.Phone),
                U.Col(x => x.Avatar),
                U.Col(x => x.IsActive),
                U.Col(x => x.IsLocked),
                $"{D.Col(x => x.Name)} AS Department"
            )
            .SelectRaw($"MAX({Ut.Col(u => u.UpdatedAt)}) as LastLogin")
            .SelectRaw($"STRING_AGG({R.Col(r => r.Name)}, ',') as RolesString")
            .GroupBy(U.Col(x => x.Id),
                U.Col(x => x.UserName),
                U.Col(x => x.Email),
                U.Col(x => x.FullName),
                U.Col(x => x.Phone),
                U.Col(x => x.Avatar),
                U.Col(x => x.IsActive),
                U.Col(x => x.IsLocked),
                D.Col(x => x.Name));
        // Count number user
        using var connection = _dbFactory.Connection;
        var countQuery = query.Clone().AsCount([$"{U.Col(u => u.Id)}"]);
        var compiledCountQuery = _compiler.Compile(countQuery);
        var total = await connection.QuerySingleAsync<int>(compiledCountQuery.Sql, compiledCountQuery.NamedBindings);

        // Apply pagination and ordering
        query.OrderBy($"{U.Col(x => x.UserName)}")
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
            IsLocked = u.IsLocked,
            Department = u.Department,
            LastAccess = u.LastAccess,
            Roles = string.IsNullOrEmpty(u.RolesString)
                ? new List<string>()
                : u.RolesString.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
        }).ToList();

        return (result, total); // Return 0 for total count as requested
    }

    public async Task<(List<UserSelectDto> Items, int TotalCount)> GetPaginatedUser2SelectAsync(
        PaginationRequest request)
    {
        // Base query for active, non-deleted users
        var query = new Query(U.Table)
            .Where(U.Col(x => x.IsDeleted), false)
            .Where(U.Col(x => x.IsActive), true);

        // Apply search filter
        if (!string.IsNullOrEmpty(request.SearchValue))
        {
            query.Where(q => q
                .WhereLike(U.Col(x => x.UserName), $"%{request.SearchValue}%")
                .OrWhereLike(U.Col(x => x.Email), $"%{request.SearchValue}%")
                .OrWhereLike(U.Col(x => x.FullName), $"%{request.SearchValue}%"));
        }

        using var connection = _dbFactory.Connection;

        // Get total count
        var countQuery = query.Clone().AsCount();
        var countCompiled = _compiler.Compile(countQuery);
        var totalCount = await connection.QuerySingleAsync<int>(countCompiled.Sql, countCompiled.NamedBindings);

        // Get paginated results
        var selectQuery = query.Clone()
            .Select(U.Col(x => x.Id),
                U.Col(x => x.UserName),
                U.Col(x => x.Email),
                U.Col(x => x.FullName),
                U.Col(x => x.Avatar))
            .OrderBy(U.Col(x => x.UserName))
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