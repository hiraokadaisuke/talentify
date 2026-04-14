'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS_CHANGED_EVENT,
  NotificationRow,
} from '@/utils/notifications'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'
import { getActionLabel, getNotificationLink, isActionRequired } from './notification-meta'

type TabType = 'all' | 'unread' | 'action_required' | 'announcement'

const PRIORITY_LABEL: Record<NotificationRow['priority'], string> = {
  low: '低',
  medium: '中',
  high: '高',
}


function isResurfacedNotification(notification: NotificationRow): boolean {
  const createdAt = new Date(notification.created_at).getTime()
  const updatedAt = new Date(notification.updated_at).getTime()
  return Number.isFinite(createdAt) && Number.isFinite(updatedAt) && updatedAt - createdAt > 60_000
}

export default function NotificationsInboxPage() {
  const [items, setItems] = useState<NotificationRow[]>([])
  const [tab, setTab] = useState<TabType>('all')
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMutating, setIsMutating] = useState(false)

  const loadNotifications = async (currentTab: TabType) => {
    const data = await getNotifications({
      unreadOnly: currentTab === 'unread',
      actionableOnly: currentTab === 'action_required',
      category: currentTab === 'announcement' ? 'announcement' : currentTab === 'all' ? undefined : 'notification',
    })
    setItems(data)
  }

  const refreshUnreadCount = async () => {
    setUnreadCount(await getUnreadNotificationCount())
  }

  useEffect(() => {
    loadNotifications(tab)
  }, [tab])

  useEffect(() => {
    refreshUnreadCount()
    const onNotificationsChanged = () => {
      loadNotifications(tab)
      refreshUnreadCount()
    }
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onNotificationsChanged)
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        loadNotifications(tab)
        refreshUnreadCount()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onNotificationsChanged)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [tab])

  const markAsRead = async (notification: NotificationRow) => {
    if (notification.is_read || isMutating) return
    setIsMutating(true)
    try {
      await markNotificationRead(notification.id)
      await Promise.all([loadNotifications(tab), refreshUnreadCount()])
    } finally {
      setIsMutating(false)
    }
  }

  const handleRowClick = async (notification: NotificationRow) => {
    await markAsRead(notification)
    window.location.href = getNotificationLink(notification)
  }

  const handleMarkAll = async () => {
    if (isMutating) return
    const unreadIds = items.filter((item) => !item.is_read).map((item) => item.id)
    setIsMutating(true)
    try {
      await markAllNotificationsRead(unreadIds)
      await Promise.all([loadNotifications(tab), refreshUnreadCount()])
    } finally {
      setIsMutating(false)
    }
  }

  const emptyStateText =
    tab === 'unread'
      ? '未読通知はありません'
      : tab === 'action_required'
        ? '要対応の通知はありません'
        : tab === 'announcement'
          ? 'お知らせはまだありません'
          : '通知はありません'

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">通知</h1>
          <p className="text-sm text-muted-foreground" data-testid="notifications-unread-count">
            未読 {unreadCount} 件
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAll}
          disabled={unreadCount === 0 || isMutating}
          data-testid="notifications-mark-all-read"
        >
          一括既読
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'すべて' },
          { key: 'unread', label: '未読' },
          { key: 'action_required', label: '要対応' },
          { key: 'announcement', label: 'お知らせ' },
        ].map((option) => (
          <Button
            key={option.key}
            variant={tab === option.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab(option.key as TabType)}
            data-testid={`notifications-tab-${option.key}`}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {items.map((notification) => (
          <div
            key={notification.id}
            data-testid={`notification-row-${notification.id}`}
            className={`cursor-pointer rounded-lg border p-4 transition hover:bg-accent/40 ${
              notification.is_read ? 'bg-white' : 'bg-blue-50/70 border-blue-100'
            } ${notification.priority === 'high' ? 'border-l-4 border-l-amber-500' : ''}`}
            onClick={() => handleRowClick(notification)}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{notification.title}</p>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                優先度: {PRIORITY_LABEL[notification.priority]}
              </span>
              {!notification.is_read && <span className="text-xs text-blue-600">未読</span>}
              {isActionRequired(notification) && (
                <span className="text-xs rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">要対応</span>
              )}
            </div>
            {notification.body && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{notification.body}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>{notification.actor_name || 'Talentify'}</span>
              <span>{formatJaDateTimeWithWeekday(notification.created_at)}</span>
              {isResurfacedNotification(notification) && <span className="text-amber-700">再通知</span>}
              <span className="ml-auto text-primary">{getActionLabel(notification)}</span>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
            {emptyStateText}
          </div>
        )}
      </div>
    </div>
  )
}
