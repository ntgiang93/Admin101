using Core.Domain.Entities.System;
using Microsoft.AspNetCore.Authorization;

namespace Admin.Api.Common.Security.Policies
{
    public class PermissionRequirement : IAuthorizationRequirement
    {
        public RolePermission Permission { get; }
        public PermissionRequirement(RolePermission permission) => Permission = permission;
    }
}
