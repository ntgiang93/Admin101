using System.Security.Claims;
using Admin.Api.Common.Security.User;
using Microsoft.AspNetCore.Http;

namespace Common.Security.User;

public class JwtUserInfoMiddleware
{
    private readonly RequestDelegate _next;

    public JwtUserInfoMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Clear the current user context to ensure fresh data
        UserContext.Clear();

        // Extract and process JWT token if the user is authenticated
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var roles = GetClaimValues(context.User, ClaimTypes.Role);
            var currentUser = new CurrentUser
            {
                UserId = GetClaimValue(context.User, ClaimTypes.NameIdentifier) ?? string.Empty,
                UserName = GetClaimValue(context.User, ClaimTypes.Name) ?? string.Empty,
                Language = context.Request.Cookies["USER_LOCALE"],
                Roles = roles.Select(role => int.TryParse(role, out int roleId) ? roleId : 0).ToList(),
                RoleCodes = GetClaimValue(context.User, "RoleCode") ?? string.Empty
            };

            // Store the current user in the AppContext
            UserContext.Current = currentUser;
        }

        // Continue with the request pipeline
        await _next(context);
    }

    private static string? GetClaimValue(ClaimsPrincipal user, string claimType)
    {
        return user.FindFirst(claimType)?.Value;
    }

    private static List<string> GetClaimValues(ClaimsPrincipal user, string claimType)
    {
        return user.Claims
            .Where(c => c.Type == claimType)
            .Select(c => c.Value)
            .ToList();
    }
}