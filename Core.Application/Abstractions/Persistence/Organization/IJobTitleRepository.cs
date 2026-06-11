using Core.Domain.Entities.Organization;

namespace Core.Application.Abstractions.Persistence.Organization;

public interface IJobTitleRepository : IGenericRepository<JobTitle, int>
{
    // Add specific methods if needed
}