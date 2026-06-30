using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Domain.Entities.Organization;

[Table("user_organization_unit")]
public class UserOrganizationUnit : BaseEntity<int>
{
    [Required] public required string UserId { get; set; }

    [Required] public int OrganizationUnitId { get; set; }
    public bool IsPrimary { get; set; } = false;
}