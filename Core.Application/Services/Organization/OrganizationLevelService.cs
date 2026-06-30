using Core.Application.Abstractions.Persistence.Organization;
using Core.Application.Abstractions.Services.Organization;
using Core.Application.Contracts.Organization;
using Core.Application.Exceptions;
using Core.Application.Services.Common;
using Core.Domain.Constants;
using Core.Domain.Entities.Organization;
using Mapster;

namespace Core.Application.Services.Organization;

public class OrganizationLevelService : GenericService<OrganizationLevel, int>, IOrganizationLevelService
{
    private readonly IOrganizationLevelRepository _organizationLevelRepository;

    public OrganizationLevelService(
        IOrganizationLevelRepository organizationLevelRepository,
        IServiceProvider serviceProvider) : base(organizationLevelRepository, serviceProvider)
    {
        _organizationLevelRepository = organizationLevelRepository;
    }

    public async Task<OrganizationLevelDto> CreateAsync(CreateOrganizationLevelDto dto)
    {
        // Check if code exists
        var existingorganizationLevel = await GetSingleAsync<OrganizationLevel>(x => x.Code == dto.Code && x.IsDeleted == false);
        if (existingorganizationLevel != null)
            throw new BusinessException(Localizer.Get(MsgKey.Validation.CodeExisted), "DEPARTMENT_TYPE_CODE_EXISTS");

        var OrganizationLevel = dto.Adapt<OrganizationLevel>();
        var id = await CreateAsync(OrganizationLevel);
        
        var neworganizationLevel = await GetByIdAsync<OrganizationLevelDto>(id);
        return neworganizationLevel;
    }

    public async Task<bool> UpdateAsync(UpdateOrganizationLevelDto dto)
    {
        // Check if code exists for another record
        var existingCode = await GetSingleAsync<OrganizationLevel>(x => x.Code == dto.Code && x.Id != dto.Id && x.IsDeleted == false);
        if (existingCode != null)
            throw new BusinessException(Localizer.Get(MsgKey.Validation.CodeExisted), "DEPARTMENT_TYPE_CODE_EXISTS");

        // Check if the department type exists
        var existingorganizationLevel = await GetSingleAsync<OrganizationLevel>(x => x.Id == dto.Id && x.IsDeleted == false);
        if (existingorganizationLevel == null)
            throw new NotFoundException(Localizer.Get(MsgKey.Validation.CodeExisted), "DEPARTMENT_TYPE_NOT_FOUND");

        var OrganizationLevel = dto.Adapt<OrganizationLevel>();
        var result = await UpdateAsync(OrganizationLevel);
        return result;
    }
}