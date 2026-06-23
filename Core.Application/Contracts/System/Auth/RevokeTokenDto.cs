namespace Core.Application.Contracts.System.Auth
{
    public class RevokeTokenDto
    {
        public required List<string> DeviceIds { get; set; }
    }
}
