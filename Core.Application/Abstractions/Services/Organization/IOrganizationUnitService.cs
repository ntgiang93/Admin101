using Core.Application.Abstractions.Common;
using Core.Application.Contracts.Organization;
using Core.Domain.Entities.Organization;

namespace Core.Application.Abstractions.Services.Organization;

public interface IOrganizationUnitService : IGenericService<OrganizationUnit, int>
{
    /// <summary>
    ///     Gets organizationUnit tree structure
    /// </summary>
    Task<List<OrganizationUnitDto>> GetOrganizationUnitTreeAsync();

    /// <summary>
    ///     Creates a new organizationUnit
    /// </summary>
    Task<OrganizationUnitDto> CreateOrganizationUnitAsync(DetailOrganizationUnitDto dto);

    /// <summary>
    ///     Updates an existing organizationUnit
    /// </summary>
    Task<bool> UpdateOrganizationUnitAsync(DetailOrganizationUnitDto dto);

    /// <summary>
    ///     Deletes a organizationUnit
    /// </summary>
    Task<bool> DeleteOrganizationUnitAsync(int id);
    /// <summary>
    ///     Gets a organizationUnit tree structure
    /// </summary>
    Task<List<OrganizationUnitDto>> GetSingleOrganizationUnitTreeAsync(int id);
}