using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

// ...existing using statements...

namespace Core.Domain.Entities.Organization;

[Table("organization_level")]
public class OrganizationLevel : BaseEntity<int>
{
    [Required][StringLength(50)] public string Code { get; set; } = string.Empty;

    [Required][StringLength(100)] public string Name { get; set; } = string.Empty;

    [StringLength(1000)] public string? Description { get; set; }

    public int Rank { get; set; }
    public bool IsActive { get; set; }
    public bool IsRoot { get; set; }
}