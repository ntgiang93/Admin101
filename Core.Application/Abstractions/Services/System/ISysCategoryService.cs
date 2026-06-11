using Core.Application.Abstractions.Common;
using Core.Application.Contracts.System;
using Core.Domain.Entities.System;

namespace Core.Application.Abstractions.Services.System;

public interface ISysCategoryService : IGenericService<SysCategory, int>
{
    Task<List<CategoryDto>> GetByTypeAsync(string type);
    Task<bool> CreateCategoryAsync(CategoryDto dto);
    Task<bool> UpdateCategoryAsync(CategoryDto dto);
    Task<bool> DeleteCategoryAsync(int id);
    Task<List<CategoryTreeDto>> GetTreeAsync();
}