using Admin.Api.Common.Security.Policies;
using Core.Application.Abstractions.Localization;
using Core.Application.Abstractions.Services.Job;
using Core.Application.Contracts.Base;
using Core.Application.Contracts.System;
using Core.Domain.Constants;
using Core.Domain.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Admin.Api.Controllers.System
{
    [Authorize]
    [ApiController]
    [Route("api/job-schedules")]
    public class JobScheduleController : ControllerBase
    {
        private readonly IJobScheduleService _scheduler;
        private readonly ISysMessageService _sysMsg;

        public JobScheduleController(IJobScheduleService scheduler, ISysMessageService sysMsg)
        {
            _scheduler = scheduler;
            _sysMsg = sysMsg;
        }
        
        [HttpGet()]
        [Policy(ESysModule.JobScheduler, EPermission.View)]
        public async Task<IActionResult> GetJobs()
        {
            var jobs = await _scheduler.GetAllJobsAsync();
            return Ok(ApiResponse<IEnumerable<JobScheduleDto>>.Succeed(jobs, _sysMsg.Get(EMessage.SuccessMsg)));
        }
        
        [HttpGet("{id}")]
        [Policy(ESysModule.JobScheduler, EPermission.View)]
        public async Task<IActionResult> GetJobs(int id)
        {
            var jobs = await _scheduler.GetSingleAsync<DetailCJobConfigurationDto>(j => j.Id == id && j.IsDeleted == false);
            if(jobs == null) 
                return NotFound(ApiResponse<DetailCJobConfigurationDto>.Fail(_sysMsg.Get(EMessage.Error404Msg)));
            return Ok(ApiResponse<DetailCJobConfigurationDto>.Succeed(jobs, _sysMsg.Get(EMessage.SuccessMsg)));
        }
        
        [HttpGet("types")]
        [Policy(ESysModule.JobScheduler, EPermission.View)]
        public async Task<IActionResult> GetJobTypes()
        {
            var jobTypes = await _scheduler.GetJobTypeAsync();
            return Ok(ApiResponse<List<string>>.Succeed(jobTypes, _sysMsg.Get(EMessage.SuccessMsg)));
        }
        
        [HttpPost()]
        [Policy(ESysModule.JobScheduler, EPermission.Create)]
        public async Task<IActionResult> CreateJob(DetailCJobConfigurationDto dto)
        {
            var result = await _scheduler.CreateJobAsync(dto);
            if (result) return Ok(ApiResponse<bool>.Succeed(result, _sysMsg.Get(EMessage.SuccessMsg)));
            return Ok(ApiResponse<bool>.Fail(_sysMsg.Get(EMessage.FailureMsg)));
        }

        [HttpPost("trigger")]
        [Policy(ESysModule.JobScheduler, EPermission.Edit)]
        public async Task<IActionResult> TriggerJob([FromBody] string jobName)
        {
            await _scheduler.TriggerJobAsync(jobName);
            return Ok(ApiResponse<bool>.Succeed(true, _sysMsg.Get(EMessage.SuccessMsg)));
        }

        [HttpPost("pause")]
        [Policy(ESysModule.JobScheduler, EPermission.Edit)]
        public async Task<IActionResult> PauseJob([FromBody] string jobName)
        {
            await _scheduler.PauseJobAsync(jobName);
            return Ok(ApiResponse<bool>.Succeed(true, _sysMsg.Get(EMessage.SuccessMsg)));
        }

        [HttpPost("resume")]
        [Policy(ESysModule.JobScheduler, EPermission.Edit)]
        public async Task<IActionResult> ResumeJob([FromBody] string jobName)
        {
            await _scheduler.ResumeJobAsync(jobName);
            return Ok(ApiResponse<bool>.Succeed(true, _sysMsg.Get(EMessage.SuccessMsg)));
        }
        
        [HttpPut()]
        [Policy(ESysModule.JobScheduler, EPermission.Edit)]
        public async Task<IActionResult> UpdateJobAsync(UpdateJobScheduleDto dto)
        {
            var result = await _scheduler.UpdateJobAsync(dto);
            if (result) return Ok(ApiResponse<bool>.Succeed(result, _sysMsg.Get(EMessage.SuccessMsg)));
            return Ok(ApiResponse<bool>.Fail(_sysMsg.Get(EMessage.FailureMsg)));
        }
        
        [HttpDelete("{id}")]
        [Policy(ESysModule.JobScheduler, EPermission.Delete)]
        public async Task<IActionResult> DeleteJobAsync(int id)
        {
            var result = await _scheduler.SoftDeleteAsync(id);
            if (result) return Ok(ApiResponse<bool>.Succeed(result, _sysMsg.Get(EMessage.SuccessMsg)));
            return Ok(ApiResponse<bool>.Fail(_sysMsg.Get(EMessage.FailureMsg)));
        }
    }
}