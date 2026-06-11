using Core.Application.Abstractions.Persistence.Organization;
using Core.Application.Abstractions.Services.Organization;
using Core.Application.Contracts.Organization;
using Core.Application.Exceptions;
using Core.Application.Services.Common;
using Core.Domain.Constants;
using Core.Domain.Entities.Organization;
using Mapster;

namespace Core.Application.Services.Organization;

public class JobTitleService : GenericService<JobTitle, int>, IJobTitleService
{
    private readonly IJobTitleRepository _jobTitleRepository;

    public JobTitleService(
        IJobTitleRepository jobTitleRepository,
        IServiceProvider serviceProvider) : base(jobTitleRepository, serviceProvider)
    {
        _jobTitleRepository = jobTitleRepository;
    }

    public async Task<JobTitleDto> CreateJobTitleAsync(JobTitleDto dto)
    {
        // Check if code exists
        var existingJobTitle = await GetSingleAsync<JobTitle>(x => x.Code == dto.Code && x.IsDeleted == false);
        if (existingJobTitle != null)
            throw new BusinessException(SysMsg.Get(EMessage.CodeIsExist), "JOB_TITLE_CODE_EXISTS");

        var jobTitle = dto.Adapt<JobTitle>();
        var id = await CreateAsync(jobTitle);
        
        var newJobTitle = await GetByIdAsync<JobTitleDto>(id);
        return newJobTitle;
    }

    public async Task<bool> UpdateJobTitleAsync(JobTitleDto dto)
    {
        // Check if code exists for another record
        var existingCode = await GetSingleAsync<JobTitle>(x => x.Code == dto.Code && x.Id != dto.Id && x.IsDeleted == false);
        if (existingCode != null)
            throw new BusinessException(SysMsg.Get(EMessage.CodeIsExist), "JOB_TITLE_CODE_EXISTS");

        // Check if the job title exists
        var existingJobTitle = await GetSingleAsync<JobTitle>(x => x.Id == dto.Id && x.IsDeleted == false);
        if (existingJobTitle == null)
            throw new NotFoundException(SysMsg.Get(EMessage.Error404Msg), "JOB_TITLE_NOT_FOUND");

        var jobTitle = dto.Adapt<JobTitle>();
        var result = await UpdateAsync(jobTitle);
        return result;
    }
}