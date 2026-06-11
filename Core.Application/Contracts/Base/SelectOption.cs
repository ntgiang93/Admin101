namespace Core.Application.Contracts.Base;

public class SelectOption<TKey>
{
    public required TKey Value { get; set; }
    public required string Label { get; set; }
}