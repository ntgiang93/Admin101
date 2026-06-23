using Core.Application.Abstractions.Localizer;
using Core.Application.Abstractions.Message;
using Core.Infrastructure.Resources;
using Microsoft.Extensions.Localization;

namespace Core.Infrastructure.Localizer;

public class MessageLocalizer : IMessageLocalizer
{
    private readonly IStringLocalizer<Messages> _localizer;

    public MessageLocalizer(
        IStringLocalizer<Messages> localizer)
    {
        _localizer = localizer;
    }

    public string Get(string key)
    {
        return _localizer[key];
    }
}