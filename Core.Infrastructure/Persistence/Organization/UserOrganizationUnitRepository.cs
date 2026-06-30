using Core.Application.Abstractions.Persistence;
using Core.Application.Abstractions.Persistence.Organization;
using Core.Application.Contracts.Base;
using Core.Application.Contracts.Organization;
using Core.Application.Contracts.System.User;
using Core.Domain.Entities.Organization;
using Core.Domain.Entities.System;
using Dapper;
using Shared.Common.Extensions;
using SqlKata;

namespace Core.Infrastructure.Persistence.Organization;

public class UserOrganizationUnitRepository : GenericRepository<UserOrganizationUnit, int>, IUserOrganizationUnitRepository
{
    private readonly string _tableName;
    private readonly string _userTable;
    private readonly string _departmemtTable;

    public UserOrganizationUnitRepository(IDbConnectionFactory factory) : base(factory)
    {
        _tableName = StringHelper.GetTableName<UserOrganizationUnit>();
        _userTable = StringHelper.GetTableName<User>();
        _departmemtTable = StringHelper.GetTableName<OrganizationUnit>();
    }

    public async Task<PaginatedResultDto<OrganizationUnitMemberDto>> GetPaginatedAsync(UserOrganizationUnitFilterDto filter)
    {
        var organizationUnitIds = new List<int>() { filter.OrganizationUnitId };
        using var connection = _dbFactory.Connection;
        if (filter.IsShowSubMembers)
        {
            var organizationUnitQuery = new Query(_departmemtTable);
            organizationUnitQuery.Select(
                    $"{nameof(OrganizationUnit.Id)}"
                )
                .Where($"{_departmemtTable}.{nameof(OrganizationUnit.IsDeleted)}", false)
                .WhereRaw($"CONCAT('.',{_departmemtTable}.{nameof(OrganizationUnit.TreePath)},'.') LIKE CONCAT('%.',?,'.%')",
                    filter.OrganizationUnitId);
            var compiledOrganizationUnitQuery = _compiler.Compile(organizationUnitQuery);
            var result = await connection.QueryAsync<int>(compiledOrganizationUnitQuery.Sql,
                compiledOrganizationUnitQuery.NamedBindings);
            organizationUnitIds.AddRange(result);
        }

        var query = new Query(_tableName);
        query.Select([
                $"{_tableName}.{nameof(UserOrganizationUnit.Id)}",
                $"{_userTable}.{nameof(User.Id)} as UserId",
                $"{_userTable}.{nameof(User.FullName)}",
                $"{_userTable}.{nameof(User.UserName)}",
                $"{_userTable}.{nameof(User.Avatar)}"
            ])
            .Join(_userTable, $"{_tableName}.{nameof(UserOrganizationUnit.UserId)}", $"{_userTable}.{nameof(User.Id)}")
            .WhereIn($"{_tableName}.{nameof(UserOrganizationUnit.OrganizationUnitId)}", organizationUnitIds)
            .Where($"{_tableName}.{nameof(UserOrganizationUnit.IsDeleted)}", false)
            .Where($"{_userTable}.{nameof(User.IsDeleted)}", false);

        if (!string.IsNullOrWhiteSpace(filter.SearchValue))

        {
            query.Where(q => q
                .WhereContains($"{_userTable}.{nameof(User.FullName)}", filter.SearchValue!)
                .OrWhereContains($"{_userTable}.{nameof(User.UserName)}", filter.SearchValue!)
            );
        }

        var countQuery = query.Clone().AsCount();
        var compileCountQuery = _compiler.Compile(countQuery);
        var totalCount = await connection.QuerySingleAsync<int>(compileCountQuery.Sql, compileCountQuery.NamedBindings);
        query.OrderBy($"{_userTable}.{nameof(User.FullName)}")
            .Offset((filter.Page - 1) * filter.PageSize)
            .Limit(filter.PageSize);
        var compileQuery = _compiler.Compile(query);
        var data = await connection.QueryAsync<OrganizationUnitMemberDto>(compileQuery.Sql, compileQuery.NamedBindings);

        return new PaginatedResultDto<OrganizationUnitMemberDto>
        {
            Items = data.ToList(),
            TotalCount = totalCount,
            PageIndex = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<PaginatedResultDto<UserSelectDto>> GetUserNotInOrganizationUnit(
        UserNotInOrganizationUnitFilterDto filter)
    {
        using var connection = _dbFactory.Connection;
        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Max(1, filter.PageSize);

        // 1) Collect organizationUnit ids (self + subs)
        var organizationUnitIds = new List<int> { filter.OrganizationUnitId };
        var organizationUnitQuery = new Query(_departmemtTable)
            .Select($"{nameof(OrganizationUnit.Id)}")
            .Where($"{_departmemtTable}.{nameof(OrganizationUnit.IsDeleted)}", false)
            .WhereRaw($"CONCAT('.',{_departmemtTable}.{nameof(OrganizationUnit.TreePath)},'.') LIKE CONCAT('%.',?,'.%')",
                filter.OrganizationUnitId);

        var compiledOrganizationUnitQuery = _compiler.Compile(organizationUnitQuery);
        var subIds =
            await connection.QueryAsync<int>(compiledOrganizationUnitQuery.Sql, compiledOrganizationUnitQuery.NamedBindings);
        organizationUnitIds.AddRange(subIds);

        // 2) Base query: users NOT EXISTS in UserOrganizationUnits for those organizationUnitIds
        var query = new Query(_userTable)
            .Select(new[]
            {
                $"{_userTable}.{nameof(User.Id)}",
                $"{_userTable}.{nameof(User.FullName)}",
                $"{_userTable}.{nameof(User.UserName)}",
                $"{_userTable}.{nameof(User.Avatar)}",
                $"{_userTable}.{nameof(User.Email)}",
                $"{_userTable}.{nameof(User.CreatedAt)}"
            })
            .WhereNotExists(q => q
                .From(_tableName)
                .WhereColumns($"{_tableName}.{nameof(UserOrganizationUnit.UserId)}", "=", $"{_userTable}.{nameof(User.Id)}")
                .WhereIn($"{_tableName}.{nameof(UserOrganizationUnit.OrganizationUnitId)}", organizationUnitIds)
            )
            .Where($"{_userTable}.{nameof(User.IsDeleted)}", false);

        // Optional search
        if (!string.IsNullOrWhiteSpace(filter.SearchValue))
        {
            query.Where(q => q
                .WhereContains($"{_userTable}.{nameof(User.FullName)}", filter.SearchValue!)
                .OrWhereContains($"{_userTable}.{nameof(User.UserName)}", filter.SearchValue!)
            );
        }

        var countQuery = query.Clone().AsCount();
        var compileCountQuery = _compiler.Compile(countQuery);
        var totalCount = await connection.QuerySingleAsync<int>(compileCountQuery.Sql, compileCountQuery.NamedBindings);

        query.OrderByDesc($"{_userTable}.{nameof(User.CreatedAt)}")
            .Offset((page - 1) * pageSize)
            .Limit(pageSize);

        var compiled = _compiler.Compile(query);
        var rows = (await connection.QueryAsync<UserSelectDto>(compiled.Sql, compiled.NamedBindings)).ToList();

        return new PaginatedResultDto<UserSelectDto>
        {
            Items = rows,
            TotalCount = totalCount,
            PageIndex = page,
            PageSize = pageSize
        };
    }

    public async Task<bool> AddMemberAsync(AddMemberOrganizationUnitDto dto, string createdBy)
    {
        using var connection = _dbFactory.Connection;
        using var transaction = connection.BeginTransaction();
        try
        {
            var cols = new[]
            {
                nameof(UserOrganizationUnit.UserId), nameof(UserOrganizationUnit.OrganizationUnitId), nameof(UserOrganizationUnit.IsDeleted),
                nameof(UserOrganizationUnit.CreatedAt), nameof(UserOrganizationUnit.CreatedBy)
            };
            var data = dto.UserIds.Select(userId => new object[] { userId, dto.OrganizationUnitId, false, DateTime.Now, createdBy }).ToList();

            var query = new Query(_tableName)
                .AsInsert(cols, data);

            var compiledQuery = _compiler.Compile(query);

            // Execute the query
            await connection.ExecuteAsync(compiledQuery.Sql, compiledQuery.NamedBindings, transaction);

            transaction.Commit();
            return true;
        }
        catch (Exception ex)
        {
            // Use a proper logging framework
            Console.WriteLine($"Exception in AddMemberAsync: {ex}");
            transaction.Rollback();
            return false;
        }
    }

    public async Task<bool> RemoveMemberAsync(List<int> ids, string updatedBy)
    {
        using var connection = _dbFactory.Connection;
        using var transaction = connection.BeginTransaction();
        try
        {
            var query = new Query(_tableName)
                .WhereIn(nameof(UserOrganizationUnit.Id), ids)
                .AsUpdate(new
                {
                    IsDeleted = true,
                    UpdatedAt = DateTime.Now,
                    UpdatedBy = updatedBy
                });

            var compiledQuery = _compiler.Compile(query);

            // Execute the query
            await connection.ExecuteAsync(compiledQuery.Sql, compiledQuery.NamedBindings, transaction);

            transaction.Commit();
            return true;
        }
        catch (Exception ex)
        {
            // Use a proper logging framework
            Console.WriteLine($"Exception in AddMemberAsync: {ex}");
            transaction.Rollback();
            return false;
        }
    }

}