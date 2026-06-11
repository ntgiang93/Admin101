using Common.Security.User;
using Core.Application.Abstractions.Security;

namespace Admin.Api.Common.Security.User;

public sealed class CurrentUserAccessor : ICurrentUser
{
    private CurrentUser? Current => UserContext.Current;

    public string? UserId => Current?.UserId;
    public string? UserName => Current?.UserName;
    public string? RoleCodes => Current?.RoleCodes;
    public string? Language => Current?.Language;
    public IReadOnlyCollection<int> Roles => Current?.Roles ?? [];
    public bool IsAuthenticated => !string.IsNullOrWhiteSpace(UserId);
}
