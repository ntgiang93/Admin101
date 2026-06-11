using Core.Application.Abstractions.Common;
using Core.Domain.Entities.System;

namespace Core.Application.Abstractions.Services.System;

public interface IUserTokenService : IGenericService<UserToken, long>
{
    Task<KeyValuePair<string, string>> GenerateToken(User user);

    Task<KeyValuePair<string, DateTime>> GenerateRefreshToken(User user, string deviceId, string ipAddress,
        string accessTokenId, string? device, string? deviceToken);

    Task<bool> RevokeTokenAsync(string token);
}