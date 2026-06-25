using Core.Application.Contracts.Base;
using Core.Application.Contracts.System.Role;
using Core.Domain.Entities.System;

namespace Core.Application.Abstractions.Persistence.System;

public interface IRoleRepository : IGenericRepository<Role, int>
{
    Task<List<RolePermission>> GetRolePermission(int roleId);
    Task<bool> AddRolePermissionAsync(IEnumerable<RolePermission> rolePermissions);
    Task<bool> DeleteRolePermissionAsync(int roleId);
}