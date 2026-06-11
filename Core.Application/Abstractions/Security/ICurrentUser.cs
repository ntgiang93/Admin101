namespace Core.Application.Abstractions.Security;

public interface ICurrentUser
{
    string? UserId { get; }
    string? UserName { get; }
    string? RoleCodes { get; }
    string? Language { get; }
    IReadOnlyCollection<int> Roles { get; }
    bool IsAuthenticated { get; }
}

