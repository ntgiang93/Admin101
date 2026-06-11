using System.Security.Cryptography;
using System.Text;
using Core.Application.Abstractions.Caching;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using Serilog;

namespace Core.Infrastructure.Caching;

public class CacheManager : ICacheService
{
    public readonly IMemoryCache _cache;
    private readonly List<string> cacheKeys = new();

    public CacheManager(IMemoryCache cache)
    {
        _cache = cache;
    }

    public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? slidingExpiration = null)
    {
         if (_cache.TryGetValue(key, out var cachedObj) && cachedObj is T cacheValue)
            return cacheValue;

        var result = await factory();

        var options = new MemoryCacheEntryOptions()
            .SetSlidingExpiration(slidingExpiration ?? TimeSpan.FromMinutes(15));
        cacheKeys.Add(key);
        _cache.Set(key, result, options);
        return result;
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? slidingExpiration = null)
    {
        try
        {
            var options = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(slidingExpiration ?? TimeSpan.FromMinutes(15));
            cacheKeys.Add(key);
            _cache.Set(key, value, options);
        }
        catch (Exception e)
        {
            Log.Error(e, "Error setting cache: {Key}", key);
        }
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        if (_cache.TryGetValue(key, out var cachedObj) && cachedObj is T cacheValue)
            return cacheValue;

        return default;
    }

    public void Remove(string key)
    {
        try
        {
            _cache.Remove(key);
            cacheKeys.Remove(key);
        }
        catch (Exception e)
        {
            Log.Error(e, "Error removing cache: {Key}", key);
        }
    }

    public void RemoveByPrefix(string prefix)
    {
        try
        {
            var cacheEntries = cacheKeys.Where(k => k.StartsWith(prefix));

            foreach (var key in cacheEntries)
            {
                _cache.Remove(key);
            }
            cacheKeys.RemoveAll(k => k.StartsWith(prefix));
        }
        catch (Exception e)
        {
            Log.Error(e, "Error removing cache by prefix: {Prefix}", prefix);
        }
    }

    // Backward-compatible wrappers during migration.
    public Task SetCacheAsync<T>(string key, T value, MemoryCacheEntryOptions? options = null)
        => SetAsync(key, value, options?.SlidingExpiration);

    public Task<T?> GetCacheAsync<T>(string key)
        => GetAsync<T>(key);

    public void RemoveCache(string key)
        => Remove(key);

    public void RemoveCacheByPrefix(string prefix)
        => RemoveByPrefix(prefix);

    public static string GenerateCacheKey(string prefix, params object[] parameters)
    {
        if (parameters == null || parameters.Length == 0)
            return prefix;

        var paramString = JsonConvert.SerializeObject(parameters);
        using (var sha = SHA256.Create())
        {
            var hashBytes = sha.ComputeHash(Encoding.UTF8.GetBytes(paramString));
            var hash = BitConverter.ToString(hashBytes);
            return $"{prefix}:{hash}";
        }
    }
}