using Admin.Api.Common.Security.Policies;
using Core.Application.Abstractions.Message;
using Core.Application.Abstractions.Services.Organization;
using Core.Application.Contracts.Base;
using Core.Application.Contracts.Organization;
using Core.Domain.Constants;
using Core.Domain.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Admin.Api.Controllers.Organization;

[Route("api/organization/organization-level")]
[ApiController]
[Authorize]
public class OrganizationLevelController : ControllerBase
{
    private readonly IOrganizationLevelService _organizationLevelService;
    private readonly ISysMessageService _sysMsg;

    public OrganizationLevelController(
        IOrganizationLevelService organizationLevelService,
        ISysMessageService sysMsg)
    {
        _organizationLevelService = organizationLevelService;
        _sysMsg = sysMsg;
    }

    // GET methods
    [HttpGet]
    [Policy(ESysModule.OrganizationLevel, EPermission.View)]
    public async Task<IActionResult> GetAll()
    {
        var types = await _organizationLevelService.FindAsync<OrganizationLevelDto>(x => x.IsDeleted == false);
        return Ok(ApiResponse<object>.Succeed(types, _sysMsg.Get(EMessage.SuccessMsg)));
    }


    [HttpGet("{id}")]
    [Policy(ESysModule.OrganizationLevel, EPermission.View)]
    public async Task<IActionResult> GetById(int id)
    {
        var type = await _organizationLevelService.GetByIdAsync<OrganizationLevelDto>(id);
        if (type == null)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.Error404Msg)));

        return Ok(ApiResponse<object>.Succeed(type, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // POST methods
    [HttpPost]
    [Policy(ESysModule.OrganizationLevel, EPermission.Create)]
    public async Task<IActionResult> Create([FromBody] CreateOrganizationLevelDto dto)
    {
        var newOrganizationLevel = await _organizationLevelService.CreateAsync(dto);
        if (newOrganizationLevel == null)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<OrganizationLevelDto>.Succeed(newOrganizationLevel,
            _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // PUT methods
    [HttpPut]
    [Policy(ESysModule.OrganizationLevel, EPermission.Edit)]
    public async Task<IActionResult> Update([FromBody] UpdateOrganizationLevelDto dto)
    {
        var success = await _organizationLevelService.UpdateAsync(dto);
        if (!success)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(_sysMsg.Get(EMessage.SuccessMsg)));
    }

    // DELETE methods
    [HttpDelete("{id}")]
    [Policy(ESysModule.OrganizationLevel, EPermission.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _organizationLevelService.SoftDeleteAsync(id);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(success, _sysMsg.Get(EMessage.SuccessMsg)));
    }
}