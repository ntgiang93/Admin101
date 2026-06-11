using Core.Domain.Entities.System;

namespace Core.Application.Abstractions.Services.System;

public interface IUserRoleService
{
    Task<List<UserRole>> GetAllByUserAsync(string userId);
    Task<List<UserRole>> GetAllByRoleAsync(int roleId);
    Task<bool> AddUserRoleAsync(IEnumerable<UserRole> userRoles);
    Task<bool> DeleteUserRoleAsync(IEnumerable<UserRole> userRoles);
    Task<bool> UpdateUserRoleAsync(IEnumerable<UserRole> userRoles, string userId);
    Task<UserRole> GetSingleAsync(int roleId, string userId);
    Task<bool> DeleteAsync(int roleId, string userId);
}