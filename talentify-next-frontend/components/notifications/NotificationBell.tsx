'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu'
import NotificationItem from './NotificationItem'
import type { NotificationRow } from '@/utils/notifications'
import {
  getBellNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  formatUnreadCount,
  NOTIFICATIONS_CHANGED_EVENT,
  NotificationsFetchError,
} from '@/utils/notifications'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { useUserRole } from '@/utils/useRole'

const supabase = createClient()

export default function NotificationBell() {
  const { role } = useUserRole()
  const [count, setCount] = useState(0)
  const [items, setItems] = useState<NotificationRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const refreshBell = async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsLoading(true)
    }
    setLoadError(null)
    try {
      const payload = await getBellNotifications()
      setCount(payload.count)
      setItems(payload.items)
    } catch (error) {
      if (!(error instanceof NotificationsFetchError)) {
        console.error('failed to refresh bell notifications', error)
      }
      const fallbackCount = await getUnreadNotificationCount()
      setCount(fallbackCount)
      setLoadError('通知の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshBell()
    const channel = supabase
      .channel('notifications-bell')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          refreshBell({ silent: true })
        }
      )
      .subscribe()
    const onLocalNotificationsChanged = () => {
      refreshBell({ silent: true })
    }
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onLocalNotificationsChanged)
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshBell({ silent: true })
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    const interval = setInterval(() => refreshBell({ silent: true }), 60000)
    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onLocalNotificationsChanged)
      document.removeEventListener('visibilitychange', onVisible)
      clearInterval(interval)
    }
  }, [])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) refreshBell({ silent: true })
  }

  const handleItemRead = (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    setCount((prev) => Math.max(0, prev - 1))
  }

  const handleNavigate = () => {
    setOpen(false)
  }

  const handleReadAll = async () => {
    const unreadIds = items.filter((n) => !n.is_read).map((n) => n.id)
    if (unreadIds.length === 0) return
    await markAllNotificationsRead(unreadIds)
    await refreshBell({ silent: true })
  }

  const notificationsPath = role ? `/${role}/notifications` : '/notifications'

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="通知"
          data-testid="header-notification-bell"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-orange-50 hover:text-[#C2410C] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-200"
        >
          <Bell className="h-6 w-6" />
          {count > 0 && (
            <span
              aria-live="polite"
              data-testid="header-notification-badge"
              className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#FF5A1F] px-1 text-xs font-bold text-white"
            >
              {formatUnreadCount(count)}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(420px,calc(100vw-1rem))] overflow-hidden rounded-2xl border-slate-200 p-0 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b bg-white px-4 py-3">
          <p className="text-base font-bold text-slate-900">通知</p>
          <Button variant="ghost" size="sm" onClick={handleReadAll} disabled={count === 0}>
            すべて既読
          </Button>
        </div>
        <div className="max-h-[min(65vh,440px)] space-y-2 overflow-y-auto bg-slate-50/60 p-2">
          {isLoading && <p className="text-sm text-muted-foreground px-2 py-4">読み込み中...</p>}
          {!isLoading && loadError && (
            <div className="px-2 py-4 space-y-2">
              <p className="text-sm text-destructive">{loadError}</p>
              <Button variant="outline" size="sm" onClick={() => refreshBell()}>
                再読み込み
              </Button>
            </div>
          )}
          {!isLoading && !loadError && items.length === 0 && (
            <p className="text-sm text-muted-foreground px-2 py-4">通知はありません</p>
          )}
          {!isLoading &&
            !loadError &&
            items.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onRead={handleItemRead}
              onNavigate={handleNavigate}
            />
            ))}
        </div>
        <div className="border-t bg-white">
          <Link
            href={notificationsPath}
            prefetch={false}
            onClick={handleNavigate}
            className="block px-3 py-3 text-center text-sm font-bold text-[#C2410C] hover:bg-orange-50"
          >
            すべて見る
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
