using Admin.Api.Common.Security.Policies;
using Core.Application.Abstractions.Message;
using Core.Application.Abstractions.Services.Organization;
using Core.Application.Contracts.Base;
using Core.Application.Contracts.Organization;
using Core.Domain.Constants;
using Core.Domain.Entities.Organization;
using Core.Domain.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Admin.Api.Controllers.Organization;

[Route("api/organization/user-organization-unit")]
[ApiController]
[Authorize]
public class UserOrganizationUnitController : ControllerBase
{
    private readonly ISysMessageService _sysMsg;
    private readonly IUserOrganizationUnitService _userOrganizationUnitService;

    public UserOrganizationUnitController(IUserOrganizationUnitService userOrganizationUnitService, ISysMessageService sysMsg)
    {
        _userOrganizationUnitService = userOrganizationUnitService;
        _sysMsg = sysMsg;
    }

    [HttpGet("{id}")]
    [Policy(ESysModule.OrganizationUnit, EPermission.View)]
    public async Task<IActionResult> GetUserOrganizationUnitById(int id)
    {
        var userOrganizationUnit = await _userOrganizationUnitService.GetByIdAsync<UserOrganizationUnit>(id);
        if (userOrganizationUnit == null)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.Error404Msg)));

        return Ok(ApiResponse<UserOrganizationUnit>.Succeed(userOrganizationUnit, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpPost("members")]
    [Policy(ESysModule.OrganizationUnit, EPermission.View)]
    public async Task<IActionResult> GetOrganizationUnitMembers([FromBody] UserOrganizationUnitFilterDto filter)
    {
        var members = await _userOrganizationUnitService.GetOrganizationUnitMembersPaginatedAsync(filter);
        return Ok(ApiResponse<PaginatedResultDto<OrganizationUnitMemberDto>>.Succeed(members,
            _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // DELETE methods
    [HttpDelete("{id}")]
    [Policy(ESysModule.OrganizationUnit, EPermission.Delete)]
    public async Task<IActionResult> RemoveUserFromOrganizationUnit(int id)
    {
        var success = await _userOrganizationUnitService.SoftDeleteAsync(id);
        if (!success)
            return BadRequest(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(_sysMsg.Get(EMessage.SuccessMsg)));
    }
}