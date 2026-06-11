using Core.Application.Contracts.System.Menu;
using Core.Domain.Entities.System;

namespace Core.Application.Abstractions.Persistence.System
{
    public interface IMenuRepository : IGenericRepository<Menu, int>
    {
        /// <summary>
        /// Gets all menus and arranges them in a tree structure
        /// </summary>
        Task<List<MenuDto>> GetMenuTreeAsync();

        /// <summary>
        /// Gets menus based on user permissions
        /// </summary>
        Task<List<MenuDto>> GetMenusByPermissionsAsync(List<RolePermission> permissions);
    }
}