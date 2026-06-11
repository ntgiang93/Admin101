using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Domain.Entities.Organization;

[Table("user_departments")]
public class UserDepartment : BaseEntity<int>
{
    [Required] public required string UserId { get; set; }

    [Required] public int DepartmentId { get; set; }
}