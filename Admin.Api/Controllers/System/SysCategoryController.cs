using Admin.Api.Common.Security.Policies;
using Core.Application.Abstractions.Message;
using Core.Application.Abstractions.Services.System;
using Core.Application.Contracts.Base;
using Core.Application.Contracts.System;
using Core.Domain.Constants;
using Core.Domain.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Admin.Api.Controllers.System;

[Route("api/categories")]
[ApiController]
[Authorize]
public class SysCategoryController : ControllerBase
{
    private readonly ISysCategoryService _categoryService;
    private readonly ISysModuleService _sysModuleService;
    private readonly IPermissionService _permissionService;
    private readonly ISysMessageService _sysMsg;

    public SysCategoryController(
        ISysCategoryService categoryService,
        ISysModuleService sysModuleService,
        IPermissionService permissionService,
        ISysMessageService sysMsg)
    {
        _categoryService = categoryService;
        _sysModuleService = sysModuleService;
        _permissionService = permissionService;
        _sysMsg = sysMsg;
    }

    [HttpGet("system-modules")]
    [Policy(ESysModule.SysCategories, EPermission.View)]
    public async Task<IActionResult> GetAllSysModule()
    {
        var modules = await _sysModuleService.GetModuleOptionsAsync();
        return Ok(ApiResponse<IEnumerable<SelectOption<string>>>.Succeed(modules, _sysMsg.Get(EMessage.SuccessMsg)));
    }
    
    [HttpGet("system-permissions")]
    [Policy(ESysModule.SysCategories, EPermission.View)]
    public async Task<IActionResult> GetAllPermission()
    {
        var permisons = await _permissionService.GetPermissionOptionsAsync();
        return Ok(ApiResponse<IEnumerable<SelectOption<EPermission>>>.Succeed(permisons, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet]
    [Policy(ESysModule.SysCategories, EPermission.View)]
    public async Task<IActionResult> GetAllCategories()
    {
        var categories = await _categoryService.GetAllAsync<CategoryDto>();
        return Ok(ApiResponse<IEnumerable<CategoryDto>>.Succeed(categories, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("tree")]
    [Policy(ESysModule.SysCategories, EPermission.View)]
    public async Task<IActionResult> GetCategoryTree()
    {
        IEnumerable<CategoryTreeDto>? tree = await _categoryService.GetTreeAsync();
        return Ok(ApiResponse<IEnumerable<CategoryTreeDto>>.Succeed(tree, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("type")]
    [Policy(ESysModule.SysCategories, EPermission.View)]
    public async Task<IActionResult> GetByType(string? type)
    {
        var categories = await _categoryService.GetByTypeAsync(type ?? string.Empty);
        return Ok(ApiResponse<List<CategoryDto>>.Succeed(categories, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("{id}")]
    [Policy(ESysModule.SysCategories, EPermission.View)]
    public async Task<IActionResult> GetCategoryById(int id)
    {
        var category = await _categoryService.GetByIdAsync<CategoryDto>(id);
        if (category == null)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.Error404Msg)));
        return Ok(ApiResponse<CategoryDto>.Succeed(category, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpPost]
    [Policy(ESysModule.SysCategories, EPermission.Create)]
    public async Task<IActionResult> CreateCategory([FromBody] CategoryDto categoryDto)
    {
        var success = await _categoryService.CreateCategoryAsync(categoryDto);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(null, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpPut]
    [Policy(ESysModule.SysCategories, EPermission.Edit)]
    public async Task<IActionResult> UpdateCategory([FromBody] CategoryDto categoryDto)
    {
        var success = await _categoryService.UpdateCategoryAsync(categoryDto);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(null, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpDelete("{id}")]
    [Policy(ESysModule.SysCategories, EPermission.Delete)]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var success = await _categoryService.DeleteCategoryAsync(id);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(null,_sysMsg.Get(EMessage.SuccessMsg)));
    }
}