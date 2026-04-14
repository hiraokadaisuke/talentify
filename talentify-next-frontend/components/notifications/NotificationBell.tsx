'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu'
import NotificationItem from './NotificationItem'
import type { NotificationRow } from '@/utils/notifications'
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  formatUnreadCount,
  NOTIFICATIONS_CHANGED_EVENT,
} from '@/utils/notifications'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { useUserRole } from '@/utils/useRole'

const supabase = createClient()

export default function NotificationBell() {
  const { role } = useUserRole()
  const [count, setCount] = useState(0)
  const [items, setItems] = useState<NotificationRow[]>([])

  const refreshCount = async () => {
    const c = await getUnreadNotificationCount()
    setCount(c)
  }

  const refreshItems = async () => {
    const list = await getNotifications({ limit: 8 })
    setItems(list)
  }

  useEffect(() => {
    refreshCount()
    refreshItems()
    const channel = supabase
      .channel('notifications-bell')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          refreshCount()
          refreshItems()
        }
      )
      .subscribe()
    const onLocalNotificationsChanged = () => {
      refreshCount()
      refreshItems()
    }
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onLocalNotificationsChanged)
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshCount()
        refreshItems()
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    const interval = setInterval(refreshCount, 60000)
    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onLocalNotificationsChanged)
      document.removeEventListener('visibilitychange', onVisible)
      clearInterval(interval)
    }
  }, [])

  const handleOpenChange = (open: boolean) => {
    if (open) refreshItems()
  }

  const handleItemRead = (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    refreshCount()
    refreshItems()
  }

  const handleReadAll = async () => {
    const unreadIds = items.filter((n) => !n.is_read).map((n) => n.id)
    if (unreadIds.length === 0) return
    await markAllNotificationsRead(unreadIds)
    await Promise.all([refreshCount(), refreshItems()])
  }

  const notificationsPath = role ? `/${role}/notifications` : '/notifications'

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="通知"
          className="relative p-2 rounded-full hover:bg-muted focus:outline-none"
        >
          <Bell className="h-6 w-6" />
          {count > 0 && (
            <span
              aria-live="polite"
              className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white"
            >
              {formatUnreadCount(count)}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-semibold">通知</p>
          <Button variant="ghost" size="sm" onClick={handleReadAll} disabled={count === 0}>
            すべて既読
          </Button>
        </div>
        <div className="max-h-96 overflow-y-auto p-2 space-y-2">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground px-2 py-4">通知はありません</p>
          )}
          {items.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={handleItemRead} />
          ))}
        </div>
        <div className="border-t">
          <Link
            href={notificationsPath}
            className="block px-3 py-2 text-center text-sm text-blue-600 hover:underline"
          >
            すべて見る
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
