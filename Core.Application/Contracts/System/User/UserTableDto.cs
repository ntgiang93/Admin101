using System.Text.Json.Serialization;
using Core.Application.Common;

namespace Core.Application.Contracts.System.User;

/// <summary>
///     Represents a user entry for display in a table view.
/// </summary>
public class UserTableDto
{
    public required string Id { get; set; }
    public required string UserName { get; set; }
    public string? Avatar { get; set; }
    public required string Email { get; set; }
    public string? Phone { get; set; }
    public required string FullName { get; set; }
    public required bool IsActive { get; set; }
    public required bool IsLocked { get; set; }
    public required List<string> Roles { get; set; }
    [JsonIgnore]
    public string? RolesString { get; set; }

    public string? Department { get; set; }
    public DateTime? LastAccess { get; set; }
}

public class UserSelectDto
{
    public string Id { get; set; }
    public string UserName { get; set; }
    public string Avatar { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
    public string Department { get; set; }
    public DateTime? LastLogin { get; set; }
    [JsonIgnore]
    public DateTime CreatedAt { get; set; }
}

public class UserTableRequestDto : PaginationRequest
{
    public bool? IsActive { get; set; }
    public bool? IsLocked { get; set; }
    public required List<string> Roles { get; set; }
    public required List<int> Departments { get; set; }
}