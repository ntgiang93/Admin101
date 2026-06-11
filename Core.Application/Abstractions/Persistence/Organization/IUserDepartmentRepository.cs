using Core.Application.Contracts.Base;
using Core.Application.Contracts.Organization;
using Core.Application.Contracts.System.User;
using Core.Domain.Entities.Organization;

namespace Core.Application.Abstractions.Persistence.Organization;

public interface IUserDepartmentRepository : IGenericRepository<UserDepartment, int>
{
    /// <summary>
    ///     Gets paginated list of user department assignments
    /// </summary>
    Task<PaginatedResultDto<DepartmentMemberDto>> GetPaginatedAsync(UserDepartmentFilterDto filter);

    /// <summary>
    ///     Gets paginated list of users that are not assigned to the specified department
    /// </summary>
    Task<PaginatedResultDto<UserSelectDto>> GetUserNotInDepartment(UserNotInDepartmentFilterDto filter);
    /// <summary>
    ///     Adds members to a department use transaction
    /// </summary>
    Task<bool> AddMemberAsync(AddMemberDepartmentDto dto, string createdBy);
    /// <summary>
    ///     Removes members from a department use transaction
    /// </summary>
    Task<bool> RemoveMemberAsync(List<int> ids, string updatedBy);

    
}