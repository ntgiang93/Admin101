using System.ComponentModel.DataAnnotations;
using Core.Application.Common;

namespace Core.Application.Contracts.Organization;

public class OrganizationUnitMemberDto
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public string? FullName { get; set; }
    public required string UserName { get; set; }
    public string? Avatar { get; set; }
}

public class AddMemberOrganizationUnitDto
{
    [Required] public required List<string> UserIds { get; set; }

    [Required] public int OrganizationUnitId { get; set; }
}

public class RemoveOrganizationUnitMemberDto
{
    [Required] public int OrganizationUnitId { get; set; }
    [Required] public List<string> UserIds { get; set; }
}

public class UserOrganizationUnitFilterDto: PaginationRequest
{
    public int OrganizationUnitId { get; set; }
    public bool IsShowSubMembers { get; set; }
}

public class UserNotInOrganizationUnitFilterDto : PaginationRequest
{
    public int OrganizationUnitId { get; set; }
}