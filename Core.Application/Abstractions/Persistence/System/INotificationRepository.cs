using Core.Application.Contracts.Base;
using Core.Application.Contracts.System;

namespace Core.Application.Abstractions.Persistence.System;

public interface INotificationRepository : IGenericRepository<Domain.Entities.System.NotificationEntity, int>
{
    Task<int> GetUnreadCountAsync(string userId);
    Task<bool> MarkAllAsReadAsync(string userId);
    Task<CursorPaginatedResultDto<NotificationDto, DateTime>> GetUserNotificationsAsync(NotificationsFilterDto filter);
    Task<bool> BulkCreateAsync(List<CreateNotificationDto> notifications, string createdBy);
    Task<bool> BulkDeleteAsync(List<int> ids);
}

