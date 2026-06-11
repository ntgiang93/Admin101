using System.Linq.Expressions;
using Core.Application.Abstractions.Caching;
using Core.Application.Abstractions.Common;
using Core.Application.Abstractions.Localization;
using Core.Application.Abstractions.Persistence;
using Core.Application.Abstractions.Security;
using Core.Application.Exceptions;
using Core.Domain.Constants;
using Core.Domain.Entities;
using Dapper;
using Microsoft.Extensions.DependencyInjection;

namespace Core.Application.Services.Common;

public class GenericService<TEntity, TKey> : IGenericService<TEntity, TKey>
    where TEntity : BaseEntity<TKey>
{
    protected readonly string _cachePrefix;
    protected readonly IGenericRepository<TEntity, TKey> _repository;
    protected readonly IServiceProvider _serviceProvider;

    public GenericService(IGenericRepository<TEntity, TKey> repository, IServiceProvider serviceProvider)
    {
        _repository = repository;
        _serviceProvider = serviceProvider;
        _cachePrefix = typeof(TEntity).Name + "_";
    }

    protected ISysMessageService SysMsg => _serviceProvider.GetRequiredService<ISysMessageService>();
    protected ICacheService CacheService => _serviceProvider.GetRequiredService<ICacheService>();
    protected ICurrentUser? CurrentUser => _serviceProvider.GetService<ICurrentUser>();

    public virtual async Task<TDto> GetByIdAsync<TDto>(TKey id)
    {
        return await _repository.GetByIdAsync<TDto>(id);
    }

    public virtual async Task<TDto?> GetSingleAsync<TDto>(Expression<Func<TEntity, bool>> predicate,
        bool trackChanges = false)
    {
        return await _repository.GetSingleAsync<TDto>(predicate);
    }

    public virtual async Task<IEnumerable<TDto>> GetAllAsync<TDto>()
    {
        var cacheKey = $"{_cachePrefix}GetAll";
        return await CacheService.GetOrCreateAsync(cacheKey,
            async () => { return await _repository.GetAllAsync<TDto>(); });
    }

    public virtual async Task<IEnumerable<TDto>> FindAsync<TDto>(Expression<Func<TEntity, bool>> predicate,
        bool trackChanges = false)
    {
        return await _repository.FindAsync<TDto>(predicate);
    }

    public virtual async Task<bool> UpdateAsync(TEntity entity, string username = "System")
    {
        // We need to get the entity by ID first to verify it exists
        var existingEntity = await _repository.GetByIdAsync<TEntity>(entity.Id);

        if (existingEntity == null)
            throw new NotFoundException(SysMsg.Get(EMessage.Error404Msg));
        entity.CreatedBy = existingEntity.CreatedBy;
        entity.CreatedAt = existingEntity.CreatedAt;
        entity.IsDeleted = existingEntity.IsDeleted;
        entity.UpdatedBy = CurrentUser?.UserName ?? username;
        entity.UpdatedAt = DateTime.Now;
        var result = await _repository.UpdateAsync(entity);
        if (result) CacheService.RemoveByPrefix(_cachePrefix);
        return result;
    }

    public virtual async Task<bool> SoftDeleteAsync(TKey id)
    {
        // We need to get the entity by ID first to verify it exists
        var existingEntity = await _repository.GetByIdAsync<TEntity>(id);

        if (existingEntity != null && !existingEntity.IsDeleted)
        {
            existingEntity.IsDeleted = true;
            existingEntity.UpdatedBy = CurrentUser?.UserName ?? "";
            existingEntity.UpdatedAt = DateTime.Now;
            var result = await _repository.UpdateAsync(existingEntity);
            if (result) CacheService.RemoveByPrefix(_cachePrefix);
            return result;
        }

        return true; // If the entity doesn't exist, we consider it "deleted"
    }

    public virtual async Task<bool> HardDeleteAsync(TKey id)
    {
        var entity = await _repository.GetByIdAsync<TEntity>(id);
        if (entity is null) return true;
        var result = await _repository.DeleteAsync(entity);
        if (result) CacheService.RemoveByPrefix(_cachePrefix);
        return result;
    }

    public virtual async Task<IEnumerable<T>> ExecuteSPAsync<T>(string storedProcedure,
        DynamicParameters? parameters = null)
    {
        return await _repository.ExecuteSPAsync<T>(storedProcedure, parameters);
    }

    public virtual async Task<T> ExecuteSPSingleAsync<T>(string storedProcedure, DynamicParameters? parameters = null)
    {
        return await _repository.ExecuteSPSingleAsync<T>(storedProcedure, parameters);
    }

    public virtual async Task<(IEnumerable<T> Items, int TotalCount)> ExecuteSPWithPaginationAsync<T>(
        string storedProcedure, DynamicParameters? parameters = null, int pageIndex = 1, int pageSize = 10)
    {
        return await _repository.ExecuteSPWithPaginationAsync<T>(storedProcedure, parameters, pageIndex, pageSize);
    }

    public virtual async Task<TKey?> CreateAsync(TEntity entity, string username = "System")
    {
        entity.CreatedBy = CurrentUser?.UserName ?? username;
        entity.CreatedAt = DateTime.Now;
        var id = await _repository.InsertAsync(entity);
        CacheService.RemoveByPrefix(_cachePrefix);
        return id;
    }
}