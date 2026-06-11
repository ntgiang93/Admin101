// server/Model/DTOs/Base/CursorPaginatedResultDto.cs
namespace Core.Application.Contracts.Base;

public class CursorPaginatedResultDto<T,TCursor>
{
    public List<T> Items { get; set; } = new();
    public TCursor? NextCursor { get; set; }
    public bool HasMore { get; set; }
}