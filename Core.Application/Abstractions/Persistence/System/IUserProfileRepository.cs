using Core.Application.Contracts.System.UserProfile;
using Core.Domain.Entities.System;

namespace Core.Application.Abstractions.Persistence.System
{
    public interface IUserProfileRepository : IGenericRepository<UserProfile, string>
    {
        Task<UserProfileDto?> GetByUserIdAsync(string userId);
    }
}