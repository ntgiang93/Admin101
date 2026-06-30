using Core.Application.Abstractions.Persistence;
using Core.Application.Abstractions.Persistence.Organization;
using Core.Domain.Entities.Organization;
using Dapper;
using Shared.Common.Extensions;
using SqlKata;

namespace Core.Infrastructure.Persistence.Organization
{
    public class OrganizationLevelRepository : GenericRepository<OrganizationLevel, int>, IOrganizationLevelRepository
    {
        private static readonly Alias<OrganizationLevel> Ol = new("ol");

        public OrganizationLevelRepository(IDbConnectionFactory factory) : base(factory)
        {
        }

        public async Task<List<OrganizationLevel>> GetActiveRecordsAsync()
        {
            var query = new Query(Ol.Table)
                .WhereFalse(Ol.Col(x => x.IsDeleted))
                .WhereTrue(Ol.Col(x => x.IsActive))
                .OrderBy(Ol.Col(x => x.Rank));

            var compiledQuery = _compiler.Compile(query);
            
            var connection = _dbFactory.Connection;
            var result = await connection.QueryAsync<OrganizationLevel>(compiledQuery.Sql, compiledQuery.NamedBindings);
            
            return result.ToList();
        }

        public async Task<OrganizationLevel?> GetByCodeAsync(string code)
        {
            var query = new Query(Ol.Table)
                .Where(Ol.Col(x => x.Code), code)
                .WhereFalse(Ol.Col(x => x.IsDeleted));

            var compiledQuery = _compiler.Compile(query);
            
            var connection = _dbFactory.Connection;
            var result = await connection.QueryFirstOrDefaultAsync<OrganizationLevel>(compiledQuery.Sql, compiledQuery.NamedBindings);
            
            return result;
        }
    }
}
