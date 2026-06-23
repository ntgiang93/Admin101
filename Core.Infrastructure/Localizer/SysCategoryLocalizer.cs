using Core.Application.Abstractions.Localizer;
using Core.Infrastructure.Resources;
using Microsoft.Extensions.Localization;

namespace Core.Infrastructure.Localizer;

public class SysCategoryLocalizer : ISysCategoryLocalizer
{
    private readonly IStringLocalizer<SysCategory> _localizer;

    public SysCategoryLocalizer(
        IStringLocalizer<SysCategory> localizer)
    {
        _localizer = localizer;
    }

    public string Get(string key)
    {
        return _localizer[key];
    }
}