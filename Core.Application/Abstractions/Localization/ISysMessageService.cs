using Core.Domain.Constants;

namespace Core.Application.Abstractions.Localization;

public interface ISysMessageService
{
    string Get(EMessage key);
}