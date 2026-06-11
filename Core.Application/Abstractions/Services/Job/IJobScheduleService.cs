using Core.Application.Abstractions.Common;
using Core.Application.Contracts.System;
using Core.Domain.Entities.System;

namespace Core.Application.Abstractions.Services.Job;

public interface IJobScheduleService: IGenericService<JobConfiguration, int>
{
    Task<List<string>> GetJobTypeAsync();
    Task<bool> CreateJobAsync(DetailCJobConfigurationDto dto);
    Task<bool> UpdateJobAsync(UpdateJobScheduleDto dto);
    Task<IEnumerable<JobScheduleDto>> GetAllJobsAsync();

    Task TriggerJobAsync(string jobName);

    Task PauseJobAsync(string jobName);

    Task ResumeJobAsync(string jobName);

    Task UpdateScheduleAsync(string jobName, string newCron);
}

