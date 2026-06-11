using Core.Application.Abstractions.Common;
using Core.Application.Contracts.Organization;
using Core.Domain.Entities.Organization;

namespace Core.Application.Abstractions.Services.Organization;

public interface IJobTitleService : IGenericService<JobTitle, int>
{
    Task<JobTitleDto> CreateJobTitleAsync(JobTitleDto dto);
    Task<bool> UpdateJobTitleAsync(JobTitleDto dto);
}