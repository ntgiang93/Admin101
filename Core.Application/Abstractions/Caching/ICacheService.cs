namespace Core.Application.Abstractions.Caching;

public interface ICacheService
{
    Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? slidingExpiration = null);

    Task SetAsync<T>(string key, T value, TimeSpan? slidingExpiration = null);

    Task<T?> GetAsync<T>(string key);

    void Remove(string key);

    void RemoveByPrefix(string prefix);
}

