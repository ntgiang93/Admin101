using Core.Domain.Constants;

namespace Core.Application.Abstractions.Message;

public interface ISysMessageService
{
    string Get(EMessage key);
}