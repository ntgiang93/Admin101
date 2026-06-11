using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Domain.Entities.System;

[Table("roles")]

public class Role : BaseEntity<int>
{
    [Required][StringLength(30)] public string Code { get; set; }
    [Required][StringLength(100)] public string Name { get; set; }
    [StringLength(500)] public string? Description { get; set; }
    public bool IsProtected { get; set; } = false;
}