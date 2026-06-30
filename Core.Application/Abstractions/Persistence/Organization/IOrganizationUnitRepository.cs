using Core.Application.Contracts.Organization;
using Core.Domain.Entities.Organization;

namespace Core.Application.Abstractions.Persistence.Organization;

public interface IOrganizationUnitRepository : IGenericRepository<OrganizationUnit, int>
{
    /// <summary>
    ///     Gets all organizationUnits as a tree structure
    /// </summary>
    Task<List<OrganizationUnitDto>> GetOrganizationUnitTreeAsync();
    /// <summary>
    ///     Gets a organizationUnits as a tree structure
    /// </summary>
    Task<List<OrganizationUnitDto>> GetSingleOrganizationUnitTreeAsync(int id);
}