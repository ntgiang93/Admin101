using Core.Application.Abstractions.Persistence.System;
using Core.Application.Abstractions.Services.System;
using Core.Application.Common;
using Core.Application.Contracts.System;
using Core.Application.Exceptions;
using Core.Application.Services.Common;
using Core.Domain.Constants;
using Core.Domain.Entities.System;
using Mapster;

namespace Core.Application.Services.System;

public class SysCategoryService : GenericService<SysCategory, int>, ISysCategoryService
{
    private readonly ISysCategoryRepository _repository;

    public SysCategoryService(
        ISysCategoryRepository repository,
        IServiceProvider serviceProvider) : base(repository, serviceProvider)
    {
        _repository = repository;
    }
    
    public async Task<List<CategoryTreeDto>> GetTreeAsync()
    {
        var cacheKey = CacheKeyHelper.Generate($"{_cachePrefix}GetTreeAsync");
        return await CacheService.GetOrCreateAsync(cacheKey, async () =>
        {
            var data  = await FindAsync<SysCategory>(c => c.IsDeleted == false);
            var rawResult = data.Adapt<List<CategoryTreeDto>>();
            var tree = await MapToTree(rawResult);
            return tree;
        });
    }
    
    public async Task<List<CategoryDto>> GetByTypeAsync(string type)
    {
        var cacheKey = CacheKeyHelper.Generate($"{_cachePrefix}GetByTypeAsync", type);
        return await CacheService.GetOrCreateAsync(cacheKey, async () =>
        {
            var data  =
                await FindAsync<SysCategory>(c => c.Type == type && c.IsDeleted == false);
            var result = data.Adapt<List<CategoryDto>>();
            return result;
        });

    }

    public async Task<bool> CreateCategoryAsync(CategoryDto dto)
    {
        var existingCode =
            await GetSingleAsync<SysCategory>(c => c.Code == dto.Code && c.Type == dto.Type && c.IsDeleted == false);
        if (existingCode != null)
            throw new BusinessException(Localizer.Get(MsgKey.Validation.CodeExisted), "CATEGORY_CODE_EXISTS");
        var category = dto.Adapt<SysCategory>();
        var id = await CreateAsync(category);
        return id > 0;
    }

    public async Task<bool> UpdateCategoryAsync(CategoryDto dto)
    {
        var existingCode = await GetSingleAsync<SysCategory>(c =>
            c.Id != dto.Id && c.Code == dto.Code && c.Type == dto.Type && c.IsDeleted == false);
        if (existingCode != null)
            throw new BusinessException(Localizer.Get(MsgKey.Validation.CodeExisted), "CATEGORY_CODE_EXISTS");
        var category = await GetSingleAsync<SysCategory>(c => c.Id == dto.Id && c.IsDeleted == false);
        if (category == null) throw new NotFoundException(Localizer.Get(MsgKey.Error.NotFound), "CATEGORY_NOT_FOUND");
        category = dto.Adapt<SysCategory>();
        return await UpdateAsync(category);
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        return await SoftDeleteAsync(id);
    }
    
    private async Task<List<CategoryTreeDto>> MapToTree(List<CategoryTreeDto> categories, string type = "")
    {
        var children = categories.FindAll(c => c.Type.Equals(type));
        foreach (var child in children)
        {
            child.Children = await MapToTree(categories, child.Code);
        }

        return children;
    }
}