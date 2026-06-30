using Core.Application.Abstractions.Persistence;
using Core.Application.Abstractions.Persistence.System;
using Core.Application.Contracts.System.UserProfile;
using Core.Domain.Entities.Organization;
using Core.Domain.Entities.System;
using Dapper;
using Shared.Common.Extensions;
using SqlKata;

namespace Core.Infrastructure.Persistence.System
{
    public class UserProfileRepository : GenericRepository<UserProfile, string>, IUserProfileRepository
    {
        private readonly string _table = StringHelper.GetTableName<UserProfile>();
        private readonly string _userOrganizationUnit = StringHelper.GetTableName<UserOrganizationUnit>();
        private readonly string _organizationUnit = StringHelper.GetTableName<OrganizationUnit>();
        public UserProfileRepository(IDbConnectionFactory factory) : base(factory)
        {
        }

        // GET methods can be implemented as needed
        public async Task<UserProfileDto?> GetByUserIdAsync(string userId)
        {
            var query = new Query(_table)
                .Select($"{_table}.{nameof(UserProfile.Id)}",
                    $"{_table}.{nameof(UserProfile.Address)}",
                    $"{_table}.{nameof(UserProfile.DateOfBirth)}",
                    $"{_table}.{nameof(UserProfile.Gender)}",
                    $"{_table}.{nameof(UserProfile.JobTitleId)}",
                    $"{_userOrganizationUnit}.{nameof(UserOrganizationUnit.OrganizationUnitId)}",
                    $"{_organizationUnit}.{nameof(OrganizationUnit.Name)} as {nameof(UserProfileDto.DepartmentName)}"
                    )
                .LeftJoin(_userOrganizationUnit,$"{_table}.{nameof(UserProfile.Id)}", $"{_userOrganizationUnit}.{nameof(UserOrganizationUnit.UserId)}")
                .LeftJoin(_organizationUnit,$"{_userOrganizationUnit}.{nameof(UserOrganizationUnit.OrganizationUnitId)}", $"{_organizationUnit}.{nameof(OrganizationUnit.Id)}")
                .Where($"{_table}.{nameof(UserProfile.Id)}", userId)
                .Where($"{_table}.{nameof(UserProfile.IsDeleted)}", false);

            var compiledQuery = _compiler.Compile(query);
            
            var connection = _dbFactory.Connection;
            var result = await connection.QueryFirstOrDefaultAsync<UserProfileDto>(compiledQuery.Sql, compiledQuery.NamedBindings);
            
            return result;
        }
    }
}