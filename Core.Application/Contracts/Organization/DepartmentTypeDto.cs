using System.ComponentModel.DataAnnotations;

namespace Core.Application.Contracts.Organization;

public class OrganizationLevelDto
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public int Rank { get; set; }

    public required string Code { get; set; }
}

public class CreateOrganizationLevelDto
{
    [Required] [StringLength(20)] required public string Code { get; set; } 

    [Required] [StringLength(100)] required public string Name { get; set; }

    [StringLength(500)] public string? Description { get; set; }

    [Required] public int Rank { get; set; }
}

public class UpdateOrganizationLevelDto : CreateOrganizationLevelDto
{
    [Required] public int Id { get; set; }

}