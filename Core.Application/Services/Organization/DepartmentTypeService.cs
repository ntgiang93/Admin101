using Core.Application.Abstractions.Persistence.Organization;
using Core.Application.Abstractions.Services.Organization;
using Core.Application.Contracts.Organization;
using Core.Application.Exceptions;
using Core.Application.Services.Common;
using Core.Domain.Constants;
using Core.Domain.Entities.Organization;
using Mapster;

namespace Core.Application.Services.Organization;

public class DepartmentTypeService : GenericService<DepartmentType, int>, IDepartmentTypeService
{
    private readonly IDepartmentTypeRepository _departmentTypeRepository;

    public DepartmentTypeService(
        IDepartmentTypeRepository departmentTypeRepository,
        IServiceProvider serviceProvider) : base(departmentTypeRepository, serviceProvider)
    {
        _departmentTypeRepository = departmentTypeRepository;
    }

    public async Task<DepartmentTypeDto> CreateDepartmentTypeAsync(CreateDepartmentTypeDto dto)
    {
        // Check if code exists
        var existingDepartmentType = await GetSingleAsync<DepartmentType>(x => x.Code == dto.Code && x.IsDeleted == false);
        if (existingDepartmentType != null)
            throw new BusinessException(SysMsg.Get(EMessage.CodeIsExist), "DEPARTMENT_TYPE_CODE_EXISTS");

        var departmentType = dto.Adapt<DepartmentType>();
        var id = await CreateAsync(departmentType);
        
        var newDepartmentType = await GetByIdAsync<DepartmentTypeDto>(id);
        return newDepartmentType;
    }

    public async Task<bool> UpdateDepartmentTypeAsync(UpdateDepartmentTypeDto dto)
    {
        // Check if code exists for another record
        var existingCode = await GetSingleAsync<DepartmentType>(x => x.Code == dto.Code && x.Id != dto.Id && x.IsDeleted == false);
        if (existingCode != null)
            throw new BusinessException(SysMsg.Get(EMessage.CodeIsExist), "DEPARTMENT_TYPE_CODE_EXISTS");

        // Check if the department type exists
        var existingDepartmentType = await GetSingleAsync<DepartmentType>(x => x.Id == dto.Id && x.IsDeleted == false);
        if (existingDepartmentType == null)
            throw new NotFoundException(SysMsg.Get(EMessage.Error404Msg), "DEPARTMENT_TYPE_NOT_FOUND");

        var departmentType = dto.Adapt<DepartmentType>();
        var result = await UpdateAsync(departmentType);
        return result;
    }
}