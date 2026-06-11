using Core.Application.Abstractions.Security;
using Core.Application.Abstractions.Services.System;
using Core.Application.Contracts.Base;
using Core.Domain.Security;

namespace Core.Application.Services.System;

public class SysModuleService : ISysModuleService
{
    private readonly ICurrentUser? _currentUser;

    public SysModuleService(ICurrentUser? currentUser = null)
    {
        _currentUser = currentUser;
    }

    public Task<List<SelectOption<string>>> GetModuleOptionsAsync(string? languageCode = null)
    {
        var lang = languageCode ?? _currentUser?.Language ?? "vi";

        var options = SysModule.Modules.Select(x => new SelectOption<string>
        {
            Value = x.Key,
            Label = lang switch
            {
                "en" => x.Value.English,
                _ => x.Value.Vietnamese
            }
        }).ToList();

        return Task.FromResult(options);
    }
}

