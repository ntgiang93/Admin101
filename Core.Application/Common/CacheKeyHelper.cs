using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Core.Application.Common;

public static class CacheKeyHelper
{
    public static string Generate(string prefix, params object[] parameters)
    {
        if (parameters.Length == 0)
            return prefix;

        var paramString = JsonSerializer.Serialize(parameters);
        using var sha = SHA256.Create();
        var hashBytes = sha.ComputeHash(Encoding.UTF8.GetBytes(paramString));
        var hash = BitConverter.ToString(hashBytes);
        return $"{prefix}:{hash}";
    }
}
