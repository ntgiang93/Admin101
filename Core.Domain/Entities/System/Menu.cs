using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

// ...existing using statements...

namespace Core.Domain.Entities.System;

[Table("menus")]
public class Menu : BaseEntity<int>
{
    [Required][StringLength(100)] public string ViName { get; set; } = string.Empty;
    [Required][StringLength(100)] public string EnName { get; set; } = string.Empty;
    [Required][StringLength(200)] public string Path { get; set; } = string.Empty;

    [Required][StringLength(100)] public string? Icon { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public int? ParentId { get; set; }

    [StringLength(100)] public string? Sysmodule { get; set; }
    public bool IsGroup { get; set; }
}