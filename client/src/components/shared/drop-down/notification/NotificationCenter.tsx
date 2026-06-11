import { NotificationHook } from '@/hooks/sys/notification'
import {
  defaultNotificationsFilterDto,
  type NotificationsFilterDto,
} from '@/types/sys/Notification'
import { Button, Chip, Popover } from '@heroui/react'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { NotificationCenterContent } from './NotificationCenterContent'
import { HugeiconsIcon } from '@hugeicons/react'
import { Notification02Icon } from '@hugeicons/core-free-icons'

export const NotificationCenter = () => {
  const [filter, setFilter] = useState<NotificationsFilterDto>({
    ...defaultNotificationsFilterDto,
  })
  const [isOpen, setIsOpen] = useState(false)
  const { data: unreadCount } = NotificationHook.useGetUnreadCount()
  const { data, isFetching: loadingNotifications } =
    NotificationHook.useGetMyNotifications(filter, isOpen)

  // Reset when filter changes (except cursor)
  useEffect(() => {
    if (!isOpen) {
      setFilter({ ...defaultNotificationsFilterDto })
    }
  }, [isOpen])

  return (
    <Popover onOpenChange={setIsOpen}>
      <div className={'relative'}>
        {unreadCount && unreadCount > 0 ? (
          <Chip color="accent" className={'absolute right-0 top-0'}>
            {unreadCount}
          </Chip>
        ) : null}
        <Button
          variant="ghost"
          className={'text-default-600'}
          size={'sm'}
          isIconOnly
        >
          <HugeiconsIcon icon={Notification02Icon} size={18} />
        </Button>
      </div>
      <Popover.Content
        aria-label="Notifications"
        className={clsx('w-110 h-140 p-4 flex flex-col gap-2 justify-start')}
      >
        <Popover.Arrow />
        <Popover.Dialog>
          {isOpen && (
            <NotificationCenterContent
              filter={filter}
              setFilter={setFilter}
              data={data}
              loadingNotifications={loadingNotifications}
            />
          )}
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  )
}
