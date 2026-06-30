using Core.Application.Abstractions.Persistence.Organization;
using Core.Application.Abstractions.Services.Organization;
using Core.Application.Common;
using Core.Application.Contracts.Base;
using Core.Application.Contracts.Organization;
using Core.Application.Contracts.System.User;
using Core.Application.Services.Common;
using Core.Domain.Entities.Organization;

namespace Core.Application.Services.Organization;

public class UserOrganizationUnitService : GenericService<UserOrganizationUnit, int>, IUserOrganizationUnitService
{
    private readonly IUserOrganizationUnitRepository _userOrganizationUnitRepository;

    public UserOrganizationUnitService(
        IUserOrganizationUnitRepository userOrganizationUnitRepository,
        IServiceProvider serviceProvider) : base(userOrganizationUnitRepository, serviceProvider)
    {
        _userOrganizationUnitRepository = userOrganizationUnitRepository;
    }

    public async Task<PaginatedResultDto<OrganizationUnitMemberDto>> GetOrganizationUnitMembersPaginatedAsync(
        UserOrganizationUnitFilterDto filter)
    {
        var cacheKey = CacheKeyHelper.Generate($"{_cachePrefix}GetPaginatedUserOrganizationUnits", filter);
        var cachedResult = await CacheService.GetOrCreateAsync(cacheKey,
            async () => { return await _userOrganizationUnitRepository.GetPaginatedAsync(filter); });
        return cachedResult;
    }

    public async Task<PaginatedResultDto<UserSelectDto>> GetUserNotInOrganizationUnitAsync(UserNotInOrganizationUnitFilterDto filter)
    {
        var cacheKey = CacheKeyHelper.Generate($"{_cachePrefix}GetUserNotInOrganizationUnit", filter);
        var cachedResult = await CacheService.GetOrCreateAsync(cacheKey,
            async () => { return await _userOrganizationUnitRepository.GetUserNotInOrganizationUnit(filter); });
        return cachedResult;
    }
    public async Task<bool> AddMemberToOrganizationUnitAsync(AddMemberOrganizationUnitDto dto)
    {
        var result =  await _userOrganizationUnitRepository.AddMemberAsync(dto, CurrentUser.UserName);
        if(result) CacheService.RemoveByPrefix(_cachePrefix);
        return result;
    }
    
    public async Task<bool> RemoveOrganizationUnitMemberAsync(List<int> ids)
    {
        var result =  await _userOrganizationUnitRepository.RemoveMemberAsync(ids, CurrentUser.UserName);
        if(result) CacheService.RemoveByPrefix(_cachePrefix);
        return result;
    }
}