using Core.Application.Abstractions.Common;
using Core.Application.Contracts.System.UserProfile;
using Core.Domain.Entities.System;

namespace Core.Application.Abstractions.Services.System;

public interface IUserProfileService : IGenericService<UserProfile, string>
{
    /// <summary>
    ///     Gets user profile
    /// </summary>
    Task<UserProfileDto?> GetUserProfileAsync(string userId);
    /// <summary>
    ///     Creates or updates user profile
    /// </summary>
    Task<bool> SaveUserProfile(SaveUserProfileDto dto);
}