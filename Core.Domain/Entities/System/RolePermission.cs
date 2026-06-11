using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Core.Domain.Security;

// ...existing using statements...

namespace Core.Domain.Entities.System;

[Table("role_permissions")]
public class RolePermission
{
    [Required] public int RoleId { get; set; }

    [Required] public required string SysModule { get; set; }

    [Required] public EPermission Permission { get; set; }
}