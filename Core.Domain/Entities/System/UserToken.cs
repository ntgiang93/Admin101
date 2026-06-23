using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Domain.Entities.System;

[Table("user_tokens")]
public class UserToken : BaseEntity<long>
{
    [Required] public required string UserId { get; set; }

    [Required][StringLength(200)] public required string AccessTokenId { get; set; }
    [Required][StringLength(100)] public required string DeviceId { get; set; }

    [StringLength(100)] public string? Device { get; set; }

    [StringLength(500)]
    //<summary>
    // device token used for push notifications
    ///<summary>
    public string? DeviceToken { get; set; }

    [StringLength(45)] public string? IpAddress { get; set; }

    [Required]
    [Column(TypeName = "datetime2")]
    public DateTime Expires { get; set; }

    [Required][StringLength(200)] public required string RefreshToken { get; set; }
}