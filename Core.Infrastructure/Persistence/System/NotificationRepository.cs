using Core.Application.Abstractions.Persistence;
using Core.Application.Abstractions.Persistence.System;
using Core.Application.Contracts.Base;
using Core.Application.Contracts.System;
using Core.Domain.Entities.System;
using Dapper;
using Mapster;
using Shared.Common.Extensions;
using SqlKata;

namespace Core.Infrastructure.Persistence.System;

public class NotificationRepository : GenericRepository<NotificationEntity, int>, INotificationRepository
{
    private readonly Alias<NotificationEntity> _n = new Alias<NotificationEntity>("n");
    public NotificationRepository(IDbConnectionFactory dbFactory) : base(dbFactory)
    {
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        var query = new Query(_n.Table).Where(_n.Col(x => x.IsRead), false)
            .Where(_n.Col(x => x.IsDeleted), false)
            .Where(_n.Col(x => x.UserId), userId)
            .AsCount();
        var queryComplied = _compiler.Compile(query);
        var connection = _dbFactory.Connection;
        var count = await connection.ExecuteScalarAsync<int>(queryComplied.Sql, queryComplied.NamedBindings);
        return count;
    }

    public async Task<CursorPaginatedResultDto<NotificationDto, DateTime>> GetUserNotificationsAsync(NotificationsFilterDto filter)
    {
        var query = new Query(_n.Table)
            .Where(_n.Col(x => x.IsRead), filter.IsRead)
            .Where(_n.Col(x => x.IsDeleted), false)
            .Where(_n.Col(x => x.UserId), filter.UserId)
            .Where(_n.Col(x => x.CreatedAt), "<", filter.Cursor ?? DateTime.Now)
            .OrderByDesc(_n.Col(x => x.CreatedAt))
            .Limit(51);
        var queryComplied = _compiler.Compile(query);
        var connection = _dbFactory.Connection;
        var notifications = await connection.QueryAsync<NotificationEntity>(queryComplied.Sql, queryComplied.NamedBindings);
        var reuslt = new CursorPaginatedResultDto<NotificationDto, DateTime>();
        var enumerable = notifications.ToList();
        reuslt.HasMore = enumerable.Count() > 50;
        reuslt.Items = enumerable.Adapt<List<NotificationDto>>().Take(50).ToList();
        reuslt.NextCursor = enumerable.LastOrDefault()?.CreatedAt ?? default;
        return reuslt;
    }

    public async Task<bool> MarkAllAsReadAsync(string userId)
    {
        var query = new Query(_n.Table)
            .Where(_n.Col(x => x.UserId), userId)
            .Where(_n.Col(x => x.IsRead), false)
            .Where(_n.Col(x => x.IsDeleted), false).AsUpdate(new
            {
                IsRead = true
            });
        var compiledQuery = _compiler.Compile(query);
        var connection = _dbFactory.Connection;
        var rowsAffected = await connection.ExecuteAsync(compiledQuery.Sql, compiledQuery.NamedBindings);
        return rowsAffected > 0;
    }

    public async Task<bool> BulkCreateAsync(List<CreateNotificationDto> notifications, string createdBy)
    {
        var cols = new[] {
            _n.Col(x => x.UserId),
            _n.Col(x => x.Title),
            _n.Col(x => x.Type),
            _n.Col(x => x.Link),
            _n.Col(x => x.Metadata),
            _n.Col(x => x.Message),
            _n.Col(x => x.IsRead),
            _n.Col(x => x.CreatedAt),
            _n.Col(x => x.CreatedBy),
        };

        var data = notifications.Select(n => new object[]
        {
            n.UserId,
            n.Title,
            n.Type,
            n.Link ?? string.Empty,
            n.Metadata ?? string.Empty,
            n.Message,
            false,
            DateTime.Now,
            createdBy
        }).ToArray();
        var query = new Query(_n.Table).AsInsert(cols, data);
        var compiledQuery = _compiler.Compile(query);
        var connection = _dbFactory.Connection;
        var excuted = await connection.ExecuteAsync(compiledQuery.Sql, compiledQuery.NamedBindings);
        return excuted > 0;
    }

    public async Task<bool> BulkDeleteAsync(List<int> ids)
    {
        if (ids == null || ids.Count == 0)
            return false;

        var query = new Query(_n.Table)
            .WhereIn(_n.Col(x => x.Id), ids)
            .AsUpdate(new
            {
                IsDeleted = true
            });
        var compiledQuery = _compiler.Compile(query);
        var connection = _dbFactory.Connection;
        var rowsAffected = await connection.ExecuteAsync(compiledQuery.Sql, compiledQuery.NamedBindings);
        return rowsAffected > 0;
    }
}

