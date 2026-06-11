namespace Core.Application.Contracts.System.Auth;

public class RefreshTokenDto
{
    public string RefreshToken { get; set; }
    public string? DeviceId { get; set; }
    public string? IpAddress { get; set; }
}