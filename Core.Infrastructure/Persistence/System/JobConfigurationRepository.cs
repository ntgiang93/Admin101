using Core.Application.Abstractions.Persistence;
using Core.Application.Abstractions.Persistence.System;
using Core.Domain.Entities.System;
using Dapper;
using Shared.Common.Extensions;
using SqlKata;

namespace Core.Infrastructure.Persistence.System;

public class JobConfigurationRepository : GenericRepository<JobConfiguration, int>, IJobConfigurationRepository
{
    private readonly Alias<JobConfiguration> _jc = new ("jc");
    
    public JobConfigurationRepository(IDbConnectionFactory dbConnectionFactory) 
        : base(dbConnectionFactory)
    {
    }

    public async Task<List<JobConfiguration>> GetActiveJobsAsync()
    {
        var result = await FindAsync<JobConfiguration>(j => j.IsDeleted == false);
        return result.ToList();
    }

    public async Task<JobConfiguration?> GetByJobNameAndGroupAsync(string jobName, string jobGroup)
    {
        var query = new Query(_jc.Table)
            .Where(_jc.Col(c => c.JobName), jobName)
            .Where(_jc.Col(c => c.JobGroup), jobGroup);
        
        var compiledQuery = _compiler.Compile(query);
        var connection = _dbFactory.Connection;
        var result = await connection.QueryFirstOrDefaultAsync<JobConfiguration>(
            compiledQuery.Sql, 
            compiledQuery.NamedBindings);
        return result;
    }

    public async Task<bool> ExistsAsync(string jobName, string jobGroup)
    {
        var query = new Query(_jc.Table)
                .Where(_jc.Col(c => c.JobName), jobName)
                .Where(_jc.Col(c => c.JobGroup), jobGroup)
                .AsCount();
        
        var compiledQuery = _compiler.Compile(query);
        var connection = _dbFactory.Connection;
        var count = await connection.ExecuteScalarAsync<int>(
            compiledQuery.Sql, 
            compiledQuery.NamedBindings);
        return count > 0;
    }
}

