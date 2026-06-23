using Core.Domain.Constants;

namespace Core.Domain.Security;

[Flags]
public enum EPermission
{
    None = 0,
    View = 1 << 0, // 000001  = 1
    Create = 1 << 1, // 000010  = 2
    Edit = 1 << 2, // 000100  = 4
    Delete = 1 << 3, // 001000  = 8
    Approve = 1 << 4,// 010000  = 16
    All = View | Create | Edit | Delete | Approve
}


public static class Permission
{
    public static readonly string PermissionCacheKeyPrefix = "RolePermission_";
    
    public static readonly Dictionary<EPermission, string> Permissions = new()
    {
        { EPermission.View, SysCategoryKey.PermissionKey.View},
        { EPermission.Create, SysCategoryKey.PermissionKey.Create},
        { EPermission.Edit, SysCategoryKey.PermissionKey.Edit},
        { EPermission.Delete, SysCategoryKey.PermissionKey.Delete},
        { EPermission.Approve, SysCategoryKey.PermissionKey.Approve},
        { EPermission.All, SysCategoryKey.PermissionKey.All},
    };
}