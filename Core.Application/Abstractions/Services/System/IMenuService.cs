using Core.Application.Abstractions.Common;
using Core.Application.Contracts.System.Menu;
using Core.Domain.Entities.System;

namespace Core.Application.Abstractions.Services.System
{
    public interface IMenuService : IGenericService<Menu, int>
    {
        /// <summary>
        /// Gets all menus as a tree structure
        /// </summary>
        Task<List<MenuDto>> GetMenuTreeAsync();

        /// <summary>
        /// Gets menus based on user permissions
        /// </summary>
        Task<List<MenuDto>> GetUserMenusAsync();

        /// <summary>
        /// Creates a new menu
        /// </summary>
        Task<MenuDto> CreateMenuAsync(CreateMenuDto dto);

        /// <summary>
        /// Updates a menu
        /// </summary>
        Task<bool> UpdateMenuAsync(UpdateMenuDto dto);
    }
}