using Admin.Api.Common.Security.Policies;
using Core.Application.Abstractions.Message;
using Core.Application.Abstractions.Services.Organization;
using Core.Application.Contracts.Base;
using Core.Application.Contracts.Organization;
using Core.Application.Contracts.System.User;
using Core.Domain.Constants;
using Core.Domain.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Admin.Api.Controllers.Organization;

[Route("api/organization/organization-units")]
[ApiController]
[Authorize]
public class OrganizationUnitController : ControllerBase
{
    private readonly IOrganizationUnitService _organizationUnitService;
    private readonly IUserOrganizationUnitService _userOrganizationUnitService;
    private readonly ISysMessageService _sysMsg;

    public OrganizationUnitController(IOrganizationUnitService organizationUnitService, ISysMessageService sysMsg, IUserOrganizationUnitService userOrganizationUnitService)
    {
        _organizationUnitService = organizationUnitService;
        _userOrganizationUnitService = userOrganizationUnitService;
        _sysMsg = sysMsg;
    }

    // GET methods
    [HttpGet]
    [Policy(ESysModule.OrganizationUnit, EPermission.View)]
    public async Task<IActionResult> GetOrganizationUnitTree()
    {
        var organizationUnits = await _organizationUnitService.GetOrganizationUnitTreeAsync();
        return Ok(ApiResponse<List<OrganizationUnitDto>>.Succeed(organizationUnits, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("{id}/tree")]
    [Policy(ESysModule.OrganizationUnit, EPermission.View)]
    public async Task<IActionResult> GetSingleOrganizationUnitTree(int id)
    {
        var organizationUnits = await _organizationUnitService.GetSingleOrganizationUnitTreeAsync(id);
        return Ok(ApiResponse<List<OrganizationUnitDto>>.Succeed(organizationUnits, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("all")]
    [Policy(ESysModule.OrganizationUnit, EPermission.View)]
    public async Task<IActionResult> GetAllOrganizationUnits()
    {
        var organizationUnits = await _organizationUnitService.GetAllAsync<OrganizationUnitDto>();
        return Ok(ApiResponse<object>.Succeed(organizationUnits, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("{id}")]
    [Policy(ESysModule.OrganizationUnit, EPermission.View)]
    public async Task<IActionResult> GetOrganizationUnitById(int id)
    {
        var organizationUnit = await _organizationUnitService.GetByIdAsync<DetailOrganizationUnitDto>(id);
        if (organizationUnit == null)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.Error404Msg)));

        return Ok(ApiResponse<object>.Succeed(organizationUnit, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("get-members")]
    [Policy(ESysModule.OrganizationUnit, EPermission.View)]
    public async Task<IActionResult> GetOrganizationUnitMembers([FromQuery] UserOrganizationUnitFilterDto filter)
    {
        var members = await _userOrganizationUnitService.GetOrganizationUnitMembersPaginatedAsync(filter);
        return Ok(ApiResponse<PaginatedResultDto<OrganizationUnitMemberDto>>.Succeed(members,
            _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("users-not-in-organizationUnit")]
    [Policy(ESysModule.OrganizationUnit, EPermission.View)]
    public async Task<IActionResult> GetUserNotInOrganizationUnit([FromQuery] UserNotInOrganizationUnitFilterDto filter)
    {
        var users = await _userOrganizationUnitService.GetUserNotInOrganizationUnitAsync(filter);
        return Ok(ApiResponse<PaginatedResultDto<UserSelectDto>>.Succeed(users,
            _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // POST methods
    [HttpPost]
    [Policy(ESysModule.OrganizationUnit, EPermission.Create)]
    public async Task<IActionResult> CreateOrganizationUnit([FromBody] DetailOrganizationUnitDto createOrganizationUnitDto)
    {
        var organizationUnit = await _organizationUnitService.CreateOrganizationUnitAsync(createOrganizationUnitDto);
        if (organizationUnit == null)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<OrganizationUnitDto>.Succeed(organizationUnit, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // POST methods
    [HttpPost("add-members")]
    [Policy(ESysModule.OrganizationUnit, EPermission.Edit)]
    public async Task<IActionResult> AddMember([FromBody] AddMemberOrganizationUnitDto dto)
    {
        if (dto.OrganizationUnitId <= 0) return BadRequest(_sysMsg.Get(EMessage.Error400Msg));
        var success = await _userOrganizationUnitService.AddMemberToOrganizationUnitAsync(dto);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<bool>.Succeed(success, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // PUT methods
    [HttpPut]
    [Policy(ESysModule.OrganizationUnit, EPermission.Edit)]
    public async Task<IActionResult> UpdateOrganizationUnit([FromBody] DetailOrganizationUnitDto updateOrganizationUnitDto)
    {
        var success = await _organizationUnitService.UpdateOrganizationUnitAsync(updateOrganizationUnitDto);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(success, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // DELETE methods
    [HttpDelete("{id}")]
    [Policy(ESysModule.OrganizationUnit, EPermission.Delete)]
    public async Task<IActionResult> DeleteOrganizationUnit(int id)
    {
        var success = await _organizationUnitService.SoftDeleteAsync(id);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(success, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpDelete("remove-member")]
    [Policy(ESysModule.OrganizationUnit, EPermission.Edit)]
    public async Task<IActionResult> RemoveMember([FromBody] List<int> ids)
    {
        var success = await _userOrganizationUnitService.RemoveOrganizationUnitMemberAsync(ids);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(success, _sysMsg.Get(EMessage.SuccessMsg)));
    }
}