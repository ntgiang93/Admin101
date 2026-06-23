using Core.Application.Abstractions.Message;
using Core.Application.Abstractions.Security;
using Core.Domain.Constants;


namespace Core.Application.Services.Localization;

public class SysMessageService : ISysMessageService
{
    private readonly ICurrentUser _currentUser; 
    public SysMessageService(ICurrentUser currentUser)
    {
        _currentUser = currentUser;
    }
    public string Get(EMessage key)
    {
        //get language from AppContext
        var languageCode = _currentUser?.Language;

        if (MessageList.MessageDictionary.TryGetValue(key, out var translations))
            switch (languageCode)
            {
                case "en":
                    return translations.English;
                case "vi":
                    return translations.Vietnamese;
                default:
                    return translations.Vietnamese;
            }

        return $"[{key.ToString()}]";
    }
}