using System.Globalization;
using Core.Application.Abstractions.Localizer;
using Core.Application.Abstractions.Security;
using Core.Application.Abstractions.Services.System;
using Core.Application.Contracts.Base;
using Core.Domain.Security;

namespace Core.Application.Services.System;

public class SysModuleService : ISysModuleService
{
    private readonly ISysCategoryLocalizer _localizer;

    public SysModuleService(  ISysCategoryLocalizer localizer)
    {
        _localizer = localizer;
    }

    public async Task<List<SelectOption<string>>> GetModuleOptionsAsync(string? languageCode = null)
    {
        List<SelectOption<string>> options = new List<SelectOption<string>>();
        var modules = Enum.GetValues<ESysModule>().ToList();
        foreach (var module in modules)
        {
            var option = new SelectOption<string>
            {
                Value = module.ToString(),
                Label = _localizer.Get($"Module.{module.ToString()}")
            };
            options.Add(option);
        }
        return options;
    }
}

