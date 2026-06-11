using Core.Application.Abstractions.Persistence.Organization;
using Core.Application.Abstractions.Services.Organization;
using Core.Application.Common;
using Core.Application.Contracts.Base;
using Core.Application.Contracts.Organization;
using Core.Application.Contracts.System.User;
using Core.Application.Services.Common;
using Core.Domain.Entities.Organization;

namespace Core.Application.Services.Organization;

public class UserDepartmentService : GenericService<UserDepartment, int>, IUserDepartmentService
{
    private readonly IUserDepartmentRepository _userDepartmentRepository;

    public UserDepartmentService(
        IUserDepartmentRepository userDepartmentRepository,
        IServiceProvider serviceProvider) : base(userDepartmentRepository, serviceProvider)
    {
        _userDepartmentRepository = userDepartmentRepository;
    }

    public async Task<PaginatedResultDto<DepartmentMemberDto>> GetDepartmentMembersPaginatedAsync(
        UserDepartmentFilterDto filter)
    {
        var cacheKey = CacheKeyHelper.Generate($"{_cachePrefix}GetPaginatedUserDepartments", filter);
        var cachedResult = await CacheService.GetOrCreateAsync(cacheKey,
            async () => { return await _userDepartmentRepository.GetPaginatedAsync(filter); });
        return cachedResult;
    }

    public async Task<PaginatedResultDto<UserSelectDto>> GetUserNotInDepartmentAsync(UserNotInDepartmentFilterDto filter)
    {
        var cacheKey = CacheKeyHelper.Generate($"{_cachePrefix}GetUserNotInDepartment", filter);
        var cachedResult = await CacheService.GetOrCreateAsync(cacheKey,
            async () => { return await _userDepartmentRepository.GetUserNotInDepartment(filter); });
        return cachedResult;
    }
    public async Task<bool> AddMemberToDepartmentAsync(AddMemberDepartmentDto dto)
    {
        var result =  await _userDepartmentRepository.AddMemberAsync(dto, CurrentUser.UserName);
        if(result) CacheService.RemoveByPrefix(_cachePrefix);
        return result;
    }
    
    public async Task<bool> RemoveDepartmentMemberAsync(List<int> ids)
    {
        var result =  await _userDepartmentRepository.RemoveMemberAsync(ids, CurrentUser.UserName);
        if(result) CacheService.RemoveByPrefix(_cachePrefix);
        return result;
    }
}