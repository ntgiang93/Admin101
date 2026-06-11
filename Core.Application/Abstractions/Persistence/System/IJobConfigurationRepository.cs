using Core.Domain.Entities.System;

namespace Core.Application.Abstractions.Persistence.System;

public interface IJobConfigurationRepository : IGenericRepository<JobConfiguration, int>
{
    Task<List<JobConfiguration>> GetActiveJobsAsync();
    Task<JobConfiguration?> GetByJobNameAndGroupAsync(string jobName, string jobGroup);
    Task<bool> ExistsAsync(string jobName, string jobGroup);
}

