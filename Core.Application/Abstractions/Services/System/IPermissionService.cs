using Core.Application.Contracts.Base;
using Core.Domain.Entities.System;
using Core.Domain.Security;

namespace Core.Application.Abstractions.Services.System
{
    public interface IPermissionService
    {
        Task<List<RolePermission>> GetRolePermissionAsync(int roleId);
        void InvalidateRolePermissionCache(int roleId);
        Task<List<SelectOption<EPermission>>> GetPermissionOptionsAsync();
    }
}