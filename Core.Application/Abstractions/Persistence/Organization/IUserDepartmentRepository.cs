using Core.Application.Contracts.Base;
using Core.Application.Contracts.Organization;
using Core.Application.Contracts.System.User;
using Core.Domain.Entities.Organization;

namespace Core.Application.Abstractions.Persistence.Organization;

public interface IUserOrganizationUnitRepository : IGenericRepository<UserOrganizationUnit, int>
{
    /// <summary>
    ///     Gets paginated list of user organizationUnit assignments
    /// </summary>
    Task<PaginatedResultDto<OrganizationUnitMemberDto>> GetPaginatedAsync(UserOrganizationUnitFilterDto filter);

    /// <summary>
    ///     Gets paginated list of users that are not assigned to the specified organizationUnit
    /// </summary>
    Task<PaginatedResultDto<UserSelectDto>> GetUserNotInOrganizationUnit(UserNotInOrganizationUnitFilterDto filter);
    /// <summary>
    ///     Adds members to a organizationUnit use transaction
    /// </summary>
    Task<bool> AddMemberAsync(AddMemberOrganizationUnitDto dto, string createdBy);
    /// <summary>
    ///     Removes members from a organizationUnit use transaction
    /// </summary>
    Task<bool> RemoveMemberAsync(List<int> ids, string updatedBy);

    
}