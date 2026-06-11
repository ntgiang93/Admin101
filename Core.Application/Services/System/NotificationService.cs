using Core.Application.Abstractions.Persistence.System;
using Core.Application.Abstractions.Services.System;
using Core.Application.Contracts.Base;
using Core.Application.Contracts.System;
using Core.Application.Services.Common;
using Core.Domain.Entities.System;
using Mapster;

namespace Core.Application.Services.System;

public class NotificationService : GenericService<NotificationEntity, int>,INotificationService
{
    private readonly INotificationRepository _notificationRepository;

    public NotificationService(INotificationRepository notificationRepository, IServiceProvider serviceProvider):base(notificationRepository, serviceProvider)
    {
        _notificationRepository = notificationRepository;
    }

    public async Task<CursorPaginatedResultDto<NotificationDto,DateTime>> GetUserNotificationsAsync(
        NotificationsFilterDto filter)
    {
        return await _notificationRepository.GetUserNotificationsAsync(filter);
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        return await _notificationRepository.GetUnreadCountAsync(userId);
    }

    public async Task<bool> CreateNotificationAsync(CreateNotificationDto dto)
    {
        var notification = dto.Adapt<NotificationEntity>();
        notification.IsRead = false;
        var id = await CreateAsync(notification);
        return id > 0;
    }
    
    public async Task<bool> MarkAsReadAsync(int notificationId)
    {
        var noti = await GetSingleAsync<NotificationEntity>(n => n.IsDeleted == false && n.Id == notificationId && n.IsRead == false);
        if (noti == null) return true;
        else
        {
            noti.IsRead = true;
            return await UpdateAsync(noti);
        }
    }

    public async Task<bool> MarkAllAsReadAsync(string userId)
    {
        return await _notificationRepository.MarkAllAsReadAsync(userId);
    }

    public async Task<bool> DeleteNotificationAsync(int id)
    {
        return await SoftDeleteAsync(id);
    }

    public async Task<bool> BulkCreateNotificationsAsync(List<CreateNotificationDto> notifications)
    {
        return await _notificationRepository.BulkCreateAsync(notifications, CurrentUser.UserName);
    }

    public async Task<bool> BulkDeleteNotificationsAsync(List<int> ids)
    {
        return await _notificationRepository.BulkDeleteAsync(ids);
    }
}


