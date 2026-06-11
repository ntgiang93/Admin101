import { NotificationHook } from '@/hooks/sys/notification'
import { TimeHelper } from '@/libs/TimeHelper'
import type {
  NotificationDto,
  NotificationsFilterDto,
} from '@/types/sys/Notification'
import {
  Button,
  Card,
  Checkbox,
  Dropdown,
  ListBox,
  Separator,
} from '@heroui/react'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { AnimatePresence, motion } from 'motion/react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft02Icon,
  MoreVerticalCircle01Icon,
} from '@hugeicons/core-free-icons'

interface NotificationCenterContentProps {
  filter: NotificationsFilterDto
  setFilter: React.Dispatch<React.SetStateAction<NotificationsFilterDto>>
  data: any
  loadingNotifications: boolean
}

export const NotificationCenterContent = ({
  filter,
  setFilter,
  data,
}: NotificationCenterContentProps) => {
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationDto | null>(null)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [notifications, setNotifications] = useState<NotificationDto[]>([])
  const [checkedNotifications, setCheckedNotifications] = useState<Set<number>>(
    new Set(),
  )
  const { mutateAsync: markAsRead } = NotificationHook.useMarkAsRead()
  const { mutateAsync: markAllAsRead, isPending: isMarkingAllAsRead } =
    NotificationHook.useMarkAllAsRead()
  const { mutateAsync: deleteNotifications, isPending: isDeleting } =
    NotificationHook.useDeleteNotification()
  const listboxRef = useRef<HTMLDivElement>(null)

  const notificationItems = useMemo(() => {
    return notifications
  }, [notifications])

  const handleNotificationClick = async (notification: NotificationDto) => {
    // Mark as read first
    if (!notification.isRead) {
      await markAsRead(notification.id)
      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n,
        ),
      )
    }

    if (notification.link && notification.link.trim() !== '') {
      // If has link, open URL
      window.open(notification.link, '_blank')
    } else {
      // If no link, show detail view
      setSelectedNotification({ ...notification, isRead: true })
      setDirection(1)
    }
  }

  const handleSelect = (selected: boolean, id: number) => {
    if (selected) {
      setCheckedNotifications((prev) => new Set(prev).add(id))
    } else {
      setCheckedNotifications((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead()
    if (success) {
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    }
  }

  const handleDeleteSelected = async () => {
    const idsToDelete = Array.from(checkedNotifications)
    const success = await deleteNotifications(idsToDelete)

    if (success) {
      // Remove deleted notifications from local state
      setNotifications((prev) =>
        prev.filter((n) => !checkedNotifications.has(n.id)),
      )
      // Clear selection
      setCheckedNotifications(new Set())
    }
  }

  const handleBack = () => {
    setDirection(-1)
    setTimeout(() => {
      setSelectedNotification(null)
    }, 300)
  }

  // Handle scroll to load more
  useEffect(() => {
    const root = listboxRef.current
    const scroller = root?.querySelector<HTMLDivElement>(
      'div[data-orientation="vertical"]',
    )
    if (!scroller) return
    if (!data?.hasMore) return

    const handleScroll = (event: Event) => {
      const target = event.currentTarget as HTMLDivElement
      if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
        setFilter((prev) => ({
          ...prev,
          cursor: data?.nextCursor || null,
        }))
      }
    }

    scroller.addEventListener('scroll', handleScroll)
    return () => scroller.removeEventListener('scroll', handleScroll)
  }, [data, setFilter])

  // Update notifications list when data changes
  useEffect(() => {
    if (data) {
      if (!filter.cursor) {
        setNotifications([...data.items])
      } else {
        setNotifications((prev) => [...prev, ...data.items])
      }
    }
  }, [data?.items, filter.cursor])

  return (
    <Card className="w-full h-full" variant={'transparent'}>
      <Card.Header className="flex flex-row justify-between">
        <span className="font-bold text-xl">{'Thông báo'}</span>
        <AnimatePresence mode="popLayout" initial={false}>
          {!selectedNotification ? (
            <motion.div
              key="dropdown"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Dropdown>
                <Button isIconOnly variant="ghost" size="sm">
                  <HugeiconsIcon icon={MoreVerticalCircle01Icon} stroke="3" />
                </Button>
                <Dropdown.Menu aria-label="Static Actions">
                  <Dropdown.Item
                    key="markAll"
                    className="text-primary"
                    onPress={handleMarkAllAsRead}
                    isDisabled={isMarkingAllAsRead}
                  >
                    Đánh dấu tất cả đã đọc
                  </Dropdown.Item>
                  <Dropdown.Item
                    key="delete"
                    className="text-danger"
                    variant={'danger'}
                    onPress={handleDeleteSelected}
                    isDisabled={checkedNotifications.size === 0 || isDeleting}
                  >
                    {'Xóa đã chọn (' + checkedNotifications.size + ')'}
                  </Dropdown.Item>
                  <Dropdown.Item
                    className={clsx(filter.isRead && 'hidden')}
                    key="showRead"
                    onPress={() => {
                      setNotifications([])
                      setFilter({
                        cursor: undefined,
                        isRead: true,
                      })
                    }}
                  >
                    Hiển thị đã đọc
                  </Dropdown.Item>
                  <Dropdown.Item
                    className={clsx(!filter.isRead && 'hidden')}
                    key="showUnread"
                    onPress={() => {
                      setNotifications([])
                      setFilter({
                        cursor: undefined,
                        isRead: false,
                      })
                    }}
                  >
                    Hiển thị chưa đọc
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </motion.div>
          ) : (
            <motion.div
              key="back-button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Button isIconOnly variant="ghost" size="sm" onPress={handleBack}>
                <HugeiconsIcon icon={ArrowLeft02Icon} stroke="3" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card.Header>
      <Separator />
      <Card.Content className="overflow-hidden">
        <AnimatePresence custom={direction} initial={false} mode="popLayout">
          {!selectedNotification ? (
            <motion.div
              key="list"
              custom={direction}
              initial={{ opacity: 0, x: direction * 500 }}
              animate={{
                opacity: 1,
                x: 0,
                transition: {
                  delay: 0.2,
                  type: 'spring',
                  visualDuration: 0.3,
                  bounce: 0.4,
                },
              }}
              exit={{ opacity: 0, x: direction * -500 }}
              className="h-full"
            >
              <ListBox
                ref={listboxRef}
                items={notificationItems}
                aria-label="notification-items"
                onAction={(key: any) => {
                  const notification = notifications.find(
                    (n) => n.id === Number(key),
                  )
                  if (notification) handleNotificationClick(notification)
                }}
              >
                {(item: NotificationDto) => (
                  <ListBox.Item className={clsx(item.isRead && 'opacity-70')}>
                    <div>
                      <Checkbox
                        onChange={(val) => {
                          handleSelect(val, item.id)
                        }}
                      />
                      <div className="flex flex-col items-end gap-2">
                        {!item.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                        )}
                        <span
                          className={clsx(
                            'w-14 text-end text-sm',
                            item.isRead && 'text-default-600',
                          )}
                        >
                          {TimeHelper.DateDiffToString(
                            new Date(item.createdAt),
                            new Date(),
                            'round',
                          )}
                        </span>
                      </div>
                    </div>
                  </ListBox.Item>
                )}
              </ListBox>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              custom={direction}
              initial={{ opacity: 0, x: direction * 500 }}
              animate={{
                opacity: 1,
                x: 0,
                transition: {
                  delay: 0.2,
                  type: 'spring',
                  visualDuration: 0.3,
                  bounce: 0.4,
                },
              }}
              exit={{ opacity: 0, x: direction * -500 }}
              className="h-full flex flex-col gap-2 overflow-y-auto"
            >
              <div className="flex items-start gap-2">
                <h3 className="font-bold text-lg">
                  {selectedNotification.title}
                </h3>
              </div>
              <span className="text-sm text-default">
                {dayjs(selectedNotification.createdAt).format(
                  'HH:mm:ss DD/MM/YYYY',
                )}
              </span>
              <div className="flex-1 my-2 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
              </div>
              {selectedNotification.link && (
                <>
                  <Separator />
                  <Button
                    variant={'secondary'}
                    size="sm"
                    onPress={() =>
                      window.open(selectedNotification.link, '_blank')
                    }
                  >
                    Mở liên kết
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card.Content>
    </Card>
  )
}
