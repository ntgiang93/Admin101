using Core.Domain.Security;
using Microsoft.AspNetCore.Authorization;

namespace Admin.Api.Common.Security.Policies;

[AttributeUsage(AttributeTargets.Method)]
public class PolicyAttribute : AuthorizeAttribute
{
    public PolicyAttribute(ESysModule module, EPermission permission)
    {
        var moduleName = module.ToString();
        Policy = $"{moduleName}.{(int)permission}";
    }
}