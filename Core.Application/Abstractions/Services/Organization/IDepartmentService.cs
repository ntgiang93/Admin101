using Core.Application.Abstractions.Common;
using Core.Application.Contracts.Organization;
using Core.Domain.Entities.Organization;

namespace Core.Application.Abstractions.Services.Organization;

public interface IDepartmentService : IGenericService<Department, int>
{
    /// <summary>
    ///     Gets department tree structure
    /// </summary>
    Task<List<DepartmentDto>> GetDepartmentTreeAsync();

    /// <summary>
    ///     Creates a new department
    /// </summary>
    Task<DepartmentDto> CreateDepartmentAsync(DetailDepartmentDto dto);

    /// <summary>
    ///     Updates an existing department
    /// </summary>
    Task<bool> UpdateDepartmentAsync(DetailDepartmentDto dto);

    /// <summary>
    ///     Deletes a department
    /// </summary>
    Task<bool> DeleteDepartmentAsync(int id);
    /// <summary>
    ///     Gets a department tree structure
    /// </summary>
    Task<List<DepartmentDto>> GetSingleDepartmentTreeAsync(int id);
}