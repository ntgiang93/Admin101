using System.ComponentModel.DataAnnotations;

namespace Core.Application.Contracts.System.Auth
{
    public class VerifyAccountDto
    {
        [Required]
        [MinLength(6, ErrorMessage = "UserName must be at least 3 characters")]
        public string VerificationId { get; set; }
        [Required]
        [MinLength(6, ErrorMessage = "UserName must be at least 3 characters")]
        public string Code { get; set; }
        public string? Device { get; set; }
        public string? IpAddress { get; set; }
    }
}