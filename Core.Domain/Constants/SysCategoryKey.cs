namespace Core.Domain.Constants;

public static class SysCategoryKey
{
    public static class PermissionKey
    {
        public const string View       = "Permission.View";
        public const string Create     = "Permission.Create";
        public const string Edit       = "Permission.Edit";
        public const string Delete     = "Permission.Delete";
        public const string Approve    = "Permission.Approve";
        public const string All        = "Permission.All";
    }
    
    public static class SysModuleKey
    {
        public const string Users            = "Module.Users";
        public const string Roles            = "Module.Roles";
        public const string UserRole         = "Module.UserRole";
        public const string Menu             = "Module.Menu";
        public const string UserProfile      = "Module.UserProfile";
        public const string Files            = "Module.Files";
        public const string SysCategories    = "Module.SysCategories";
        public const string BusinessCategory = "Module.BusinessCategory";
        public const string Department       = "Module.Department";
        public const string DepartmentType   = "Module.DepartmentType";
        public const string JobTitle         = "Module.JobTitle";
        public const string JobScheduler     = "Module.JobScheduler";
    }
}