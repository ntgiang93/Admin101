using Core.Application.Contracts.Organization;
using Core.Domain.Entities.Organization;

namespace Core.Application.Abstractions.Persistence.Organization;

public interface IDepartmentRepository : IGenericRepository<Department, int>
{
    /// <summary>
    ///     Gets all departments as a tree structure
    /// </summary>
    Task<List<DepartmentDto>> GetDepartmentTreeAsync();
    /// <summary>
    ///     Gets a departments as a tree structure
    /// </summary>
    Task<List<DepartmentDto>> GetSingleDepartmentTreeAsync(int id);
}