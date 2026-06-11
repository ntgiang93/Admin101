using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Domain.Entities.Organization;

[Table("job_titles")]
public class JobTitle : BaseEntity<int>
{
    [Required][StringLength(50)] public string Code { get; set; }

    [Required][StringLength(200)] public string Name { get; set; }

    [StringLength(500)] public string Description { get; set; }
}