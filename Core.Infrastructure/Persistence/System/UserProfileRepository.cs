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
        private readonly string _userDepartment = StringHelper.GetTableName<UserDepartment>();
        private readonly string _department = StringHelper.GetTableName<Department>();
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
                    $"{_userDepartment}.{nameof(UserDepartment.DepartmentId)}",
                    $"{_department}.{nameof(Department.Name)} as {nameof(UserProfileDto.DepartmentName)}"
                    )
                .LeftJoin(_userDepartment,$"{_table}.{nameof(UserProfile.Id)}", $"{_userDepartment}.{nameof(UserDepartment.UserId)}")
                .LeftJoin(_department,$"{_userDepartment}.{nameof(UserDepartment.DepartmentId)}", $"{_department}.{nameof(Department.Id)}")
                .Where($"{_table}.{nameof(UserProfile.Id)}", userId)
                .Where($"{_table}.{nameof(UserProfile.IsDeleted)}", false);

            var compiledQuery = _compiler.Compile(query);
            
            var connection = _dbFactory.Connection;
            var result = await connection.QueryFirstOrDefaultAsync<UserProfileDto>(compiledQuery.Sql, compiledQuery.NamedBindings);
            
            return result;
        }
    }
}