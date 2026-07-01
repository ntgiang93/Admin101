using Core.Application.Common;
using Core.Application.Contracts.System.Role;
using Core.Application.Contracts.System.User;
using Core.Domain.Entities.System;

namespace Core.Application.Abstractions.Persistence.System;

public interface IUserRepository : IGenericRepository<User, string>
{
    /// <summary>
    ///     Retrieves all roles associated with a specific user
    /// </summary>
    /// <param name="userId">The ID of the user whose roles are being retrieved</param>
    /// <returns>A list of role names assigned to the user</returns>
    Task<List<RoleClaimDto>> GetRolesAsync(string userId);

    /// <summary>
    ///     Retrieves detailed information for a specific user by their ID
    /// </summary>
    /// <param name="userId">The ID of the user to retrieve details for</param>
    /// <returns>A UserDto containing detailed user information</returns>
    Task<UserDto> GetDetailAsync(string userId);

    /// <summary>
    ///     Finds users whose usernames start with the specified prefix
    /// </summary>
    /// <param name="prefix">The username prefix to search for</param>
    /// <returns>Last user with matching username prefixes</returns>
    Task<User?> FindLastUserByUserNamePrefixAsync(string prefix);

    /// <summary>
    ///     Retrieves a paginated list of users with total count based on the specified request criteria
    /// </summary>
    /// <param name="request">The request containing pagination and filtering parameters</param>
    /// <returns>A tuple containing the list of user DTOs and the total count of matching records</returns>
    Task<(List<UserTableDto> Items, int TotalCount)> GetPaginatedUsersAsync(UserTableRequestDto request);
    
    /// <summary>
    ///     Retrieves a paginated list of users for selection purposes
    /// </summary>
    /// <param name="request">The pagination request parameters</param>
    /// <returns>A tuple containing the list of user selection DTOs and the total count of matching records</returns>
    Task<(List<UserTableSelectDto> Items, int TotalCount)> GetPaginatedUser2SelectAsync(PaginationRequest request);

    /// <summary>
    ///     Retrieves user select options by search keyword
    /// </summary>
    /// <param name="searchValue">Search keyword for username, email or full name</param>
    /// <returns>List of users for select options</returns>
    Task<List<UserSelectDto>> GetUserSelectOptionsAsync(string searchValue);
}
