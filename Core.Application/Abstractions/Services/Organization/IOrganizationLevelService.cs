using Core.Application.Abstractions.Common;
using Core.Application.Contracts.Organization;
using Core.Domain.Entities.Organization;

namespace Core.Application.Abstractions.Services.Organization;

public interface IOrganizationLevelService : IGenericService<OrganizationLevel, int>
{
    Task<OrganizationLevelDto> CreateAsync(CreateOrganizationLevelDto dto);
    Task<bool> UpdateAsync(UpdateOrganizationLevelDto dto);
}