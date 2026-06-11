using Core.Application.Abstractions.Common;
using Core.Application.Contracts.Base;
using Core.Application.Contracts.Organization;
using Core.Application.Contracts.System.User;
using Core.Domain.Entities.Organization;

namespace Core.Application.Abstractions.Services.Organization;

public interface IUserDepartmentService : IGenericService<UserDepartment, int>
{
    /// <summary>
    ///     Gets paginated list of user department assignments
    /// </summary>
    Task<PaginatedResultDto<DepartmentMemberDto>> GetDepartmentMembersPaginatedAsync(UserDepartmentFilterDto filter);

    /// <summary>
    ///     Gets paginated list of users that are not assigned to the specified department
    /// </summary>
    Task<PaginatedResultDto<UserSelectDto>> GetUserNotInDepartmentAsync(UserNotInDepartmentFilterDto filter);
    /// <summary>
    ///     Adds members to a department
    /// </summary>
    Task<bool> AddMemberToDepartmentAsync(AddMemberDepartmentDto dto);
    /// <summary>
    ///   Removes members from a department
    /// </summary>
    Task<bool> RemoveDepartmentMemberAsync(List<int> ids);
}