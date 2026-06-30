using System.ComponentModel.DataAnnotations;

namespace Core.Application.Contracts.Organization
{
    public class OrganizationUnitDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Code { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string OrganizationLevelCode { get; set; } = string.Empty;

        public string OrganizationLevelName { get; set; } = string.Empty;

        public int? ParentId { get; set; }

        public string? Address { get; set; }

        public List<OrganizationUnitDto>? Children { get; set; }
    }

    public class DetailOrganizationUnitDto
    {
        public int Id { get; set; }
        [Required]
        [StringLength(100)]
        public required string Name { get; set; }

        [Required]
        [StringLength(50)]
        public required string Code { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [StringLength(30)]
        public required string OrganizationUnitTypeCode { get; set; }

        public int ParentId { get; set; }

        [StringLength(200)]
        public string? Address { get; set; }
        public required string TreePath { get; set; }

    }

    public class OrganizationUnitTreeFilterDto
    {
        public string? OrganizationUnitTypeCode { get; set; }
        public string? SearchTerm { get; set; }
    }
}
