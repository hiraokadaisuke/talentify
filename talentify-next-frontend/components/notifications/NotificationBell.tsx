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
} from '@/utils/notifications'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export default function NotificationBell() {
  const [count, setCount] = useState(0)
  const [items, setItems] = useState<NotificationRow[]>([])

  const refreshCount = async () => {
    const c = await getUnreadNotificationCount()
    setCount(c)
  }

  const refreshItems = async () => {
    const list = await getNotifications(5)
    setItems(list)
  }

  useEffect(() => {
    refreshCount()
    const channel = supabase
      .channel('notifications-bell')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => {
          refreshCount()
          refreshItems()
        }
      )
      .subscribe()

    const interval = setInterval(refreshCount, 60000)
    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])

  const handleOpenChange = (open: boolean) => {
    if (open) refreshItems()
  }

  const handleItemRead = (id: string) => {
    setCount((c) => Math.max(0, c - 1))
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
  }

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
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white"
            >
              {count > 99 ? '99+' : count}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="max-h-80 overflow-y-auto p-2">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground px-2 py-4">通知はありません</p>
          )}
          {items.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={handleItemRead} />
          ))}
        </div>
        <div className="border-t">
          <Link
            href="/notifications"
            className="block px-3 py-2 text-center text-sm text-blue-600 hover:underline"
          >
            すべて見る
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

