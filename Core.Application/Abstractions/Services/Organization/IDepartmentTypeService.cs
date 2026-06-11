using Core.Application.Abstractions.Common;
using Core.Application.Contracts.Organization;
using Core.Domain.Entities.Organization;

namespace Core.Application.Abstractions.Services.Organization;

public interface IDepartmentTypeService : IGenericService<DepartmentType, int>
{
    Task<DepartmentTypeDto> CreateDepartmentTypeAsync(CreateDepartmentTypeDto dto);
    Task<bool> UpdateDepartmentTypeAsync(UpdateDepartmentTypeDto dto);
}