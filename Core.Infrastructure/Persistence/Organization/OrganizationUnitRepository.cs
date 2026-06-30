using Core.Application.Abstractions.Persistence;
using Core.Application.Abstractions.Persistence.Organization;
using Core.Application.Contracts.Organization;
using Core.Domain.Entities.Organization;
using Dapper;
using Shared.Common.Extensions;
using SqlKata;

namespace Core.Infrastructure.Persistence.Organization;

public class OrganizationUnitRepository : GenericRepository<OrganizationUnit, int>, IOrganizationUnitRepository
{
    private static readonly Alias<OrganizationUnit> Ou = new("ou");
    private static readonly Alias<OrganizationLevel> Ol = new("ol");

    public OrganizationUnitRepository(IDbConnectionFactory factory) : base(factory)   
    {
    }

    public async Task<List<OrganizationUnitDto>> GetOrganizationUnitTreeAsync()
    {
        var query = new Query(Ou.Table);
        query.Select(
                Ou.Col(x => x.Id),
                Ou.Col(x => x.Code),
                Ou.Col(x => x.Name),
                Ou.Col(x => x.ParentId),
                Ou.Col(x => x.Description),
                Ou.Col(x => x.LevelId),
                $"{Ol.Col(x => x.Name)} AS LevelName",
                Ou.Col(x => x.Address),
                Ou.Col(x => x.TreePath)
            )
            .LeftJoin(Ol.Table, Ol.Col(x => x.Id), Ou.Col(x => x.LevelId))
            .WhereFalse(Ou.Col(x => x.IsDeleted));
        var compiledQuery = _compiler.Compile(query);

        var connection = _dbFactory.Connection;
        var allOrganizationUnits = await connection.QueryAsync<OrganizationUnitDto>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return BuildOrganizationUnitTree(allOrganizationUnits.ToList());
    }
    
   public async Task<List<OrganizationUnitDto>> GetSingleOrganizationUnitTreeAsync(int id)
   {
       var query = new Query(Ou.Table);
       query.Select(
               Ou.Col(x => x.Id),
               Ou.Col(x => x.Code),
               Ou.Col(x => x.Name),
               Ou.Col(x => x.ParentId),
               Ou.Col(x => x.Description),
               Ou.Col(x => x.LevelId),
               $"{Ol.Col(x => x.Name)} AS LevelName",
               Ou.Col(x => x.Address),
               Ou.Col(x => x.TreePath)
           )
           .LeftJoin(Ol.Table, Ol.Col(x => x.Id), Ou.Col(x => x.LevelId))
           .WhereFalse(Ou.Col(x => x.IsDeleted))
           .WhereRaw($"CONCAT('.',{Ou.Col(x => x.TreePath)},'.') LIKE CONCAT('%.',?,'.%')", id);
       
       var compiledQuery = _compiler.Compile(query);
   
       var connection = _dbFactory.Connection;
       var allOrganizationUnits = await connection.QueryAsync<OrganizationUnitDto>(compiledQuery.Sql, compiledQuery.NamedBindings);
   
       return BuildOrganizationUnitTree(allOrganizationUnits.ToList());
    }
    private List<OrganizationUnitDto> BuildOrganizationUnitTree(List<OrganizationUnitDto> allOrganizationUnits)
    {
        // Build tree structure
        var rootOrganizationUnits = allOrganizationUnits.Where(m => m.ParentId == null || m.ParentId == 0)
                                                                                .OrderBy(x => x.Name).ToList();

        // Recursive function to build organizationUnit tree
        void BuildOrganizationUnitTreeRecursive(OrganizationUnitDto parent)
        {
            parent.Children = allOrganizationUnits
                .Where(d => d.ParentId == parent.Id)
                .OrderBy(d => d.Name)
                .ToList();

            foreach (var child in parent.Children) 
                BuildOrganizationUnitTreeRecursive(child);
        }

        // Build tree for each root organizationUnit
        foreach (var rootOrganizationUnit in rootOrganizationUnits) 
            BuildOrganizationUnitTreeRecursive(rootOrganizationUnit);
            
        return rootOrganizationUnits;
    }

    public async Task<List<OrganizationUnit>> GetByLevelAsync(int organizationLevelId)
    {
        var query = new Query(Ou.Table)
            .Where(Ou.Col(x => x.LevelId), organizationLevelId)
            .WhereFalse(Ou.Col(x => x.IsDeleted))
            .OrderBy(Ou.Col(x => x.Name));
        var compiledQuery = _compiler.Compile(query);
        
        var connection = _dbFactory.Connection;
        var result = await connection.QueryAsync<OrganizationUnit>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }

    public async Task<List<OrganizationUnit>> GetByManagerAsync(long managerId)
    {
        var query = new Query($"{nameof(OrganizationUnit)}s")
            .Where(nameof(OrganizationUnit.IsDeleted), false)
            .OrderBy(nameof(OrganizationUnit.Name));

        var compiledQuery = _compiler.Compile(query);
        
        var connection = _dbFactory.Connection;
        var result = await connection.QueryAsync<OrganizationUnit>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }
}