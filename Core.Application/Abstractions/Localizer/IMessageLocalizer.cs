namespace Core.Application.Abstractions.Localizer;

public interface IMessageLocalizer
{
    string Get(string key);
}