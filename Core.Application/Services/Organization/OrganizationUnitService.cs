using Core.Application.Abstractions.Persistence.Organization;
using Core.Application.Abstractions.Services.Organization;
using Core.Application.Contracts.Organization;
using Core.Application.Exceptions;
using Core.Application.Services.Common;
using Core.Domain.Constants;
using Core.Domain.Entities.Organization;
using Mapster;

namespace Core.Application.Services.Organization;

public class OrganizationUnitService : GenericService<OrganizationUnit, int>, IOrganizationUnitService
{
    private readonly IOrganizationUnitRepository _organizationUnitRepository;

    public OrganizationUnitService(
        IOrganizationUnitRepository organizationUnitRepository,
        IServiceProvider serviceProvider) : base(organizationUnitRepository, serviceProvider)
    {
        _organizationUnitRepository = organizationUnitRepository;
    }

    public async Task<List<OrganizationUnitDto>> GetOrganizationUnitTreeAsync()
    {
        var organizationUnits = await _organizationUnitRepository.GetOrganizationUnitTreeAsync();
        return organizationUnits;
    }
    
    public async Task<List<OrganizationUnitDto>> GetSingleOrganizationUnitTreeAsync(int id)
    {
        var organizationUnits = await _organizationUnitRepository.GetSingleOrganizationUnitTreeAsync(id);
        return organizationUnits;
    }

    public async Task<OrganizationUnitDto> CreateOrganizationUnitAsync(DetailOrganizationUnitDto dto)
    {
        // Check if code exists
        var existingOrganizationUnit = await GetSingleAsync<OrganizationUnit>(x => x.Code == dto.Code && x.IsDeleted == false);
        if (existingOrganizationUnit != null)
            throw new BusinessException(Localizer.Get(MsgKey.Validation.CodeExisted), "ORGANIZATIONUNIT_CODE_EXISTS");
        // Check if parent organizationUnit exists
        var organizationUnit = dto.Adapt<OrganizationUnit>();
        if (dto.ParentId > 0)
        {
            var parentOrganizationUnit = await GetSingleAsync<OrganizationUnit>(x => x.Id == dto.ParentId);
            organizationUnit.TreePath = $"{parentOrganizationUnit?.TreePath}.{parentOrganizationUnit?.Id}";
        }
        else organizationUnit.TreePath = "0";
        var newOrganizationUnit = await CreateAsync(organizationUnit);
        return newOrganizationUnit.Adapt<OrganizationUnitDto>();
    }

    public async Task<bool> UpdateOrganizationUnitAsync(DetailOrganizationUnitDto dto)
    {
        // Check if code exists
        var existingCode = await GetSingleAsync<OrganizationUnit>(x => x.Code == dto.Code && x.Id != dto.Id && x.IsDeleted == false);
        if (existingCode != null)
            throw new BusinessException(Localizer.Get(MsgKey.Validation.CodeExisted), "ORGANIZATIONUNIT_CODE_EXISTS");
        else
        {
            var existingOrganizationUnit = await GetSingleAsync<OrganizationUnit>(x => x.Id == dto.Id && x.IsDeleted == false);
            if (existingOrganizationUnit == null)
                throw new NotFoundException(Localizer.Get(MsgKey.Error.NotFound), "ORGANIZATIONUNIT_NOT_FOUND");
        }
            var result = await UpdateAsync(dto.Adapt<OrganizationUnit>());
        return result;
    }


    public async Task<bool> DeleteOrganizationUnitAsync(int id)
    {
        var success = await SoftDeleteAsync(id);
        //if (success) await BatchUpdateAsync(d => d.ParentId == id, d => d.SetProperty(x => x.IsDeleted, true));
        return success;
    }
}