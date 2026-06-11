namespace Core.Application.Common;

public class PaginationRequest
{
    public string? SearchValue { get; set; } = string.Empty;
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}