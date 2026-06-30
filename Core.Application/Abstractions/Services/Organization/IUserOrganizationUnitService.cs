using Core.Application.Abstractions.Common;
using Core.Application.Contracts.Base;
using Core.Application.Contracts.Organization;
using Core.Application.Contracts.System.User;
using Core.Domain.Entities.Organization;

namespace Core.Application.Abstractions.Services.Organization;

public interface IUserOrganizationUnitService : IGenericService<UserOrganizationUnit, int>
{
    /// <summary>
    ///     Gets paginated list of user organizationUnit assignments
    /// </summary>
    Task<PaginatedResultDto<OrganizationUnitMemberDto>> GetOrganizationUnitMembersPaginatedAsync(UserOrganizationUnitFilterDto filter);

    /// <summary>
    ///     Gets paginated list of users that are not assigned to the specified organizationUnit
    /// </summary>
    Task<PaginatedResultDto<UserSelectDto>> GetUserNotInOrganizationUnitAsync(UserNotInOrganizationUnitFilterDto filter);
    /// <summary>
    ///     Adds members to a organizationUnit
    /// </summary>
    Task<bool> AddMemberToOrganizationUnitAsync(AddMemberOrganizationUnitDto dto);
    /// <summary>
    ///   Removes members from a organizationUnit
    /// </summary>
    Task<bool> RemoveOrganizationUnitMemberAsync(List<int> ids);
}