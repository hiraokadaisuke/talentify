'use client'

import { useEffect, useState } from 'react'
import type { NotificationRow } from '@/utils/notifications'
import {
  getNotifications,
  markAllNotificationsRead,
} from '@/utils/notifications'
import NotificationItem from '@/components/notifications/NotificationItem'
import { Button } from '@/components/ui/button'

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationRow[]>([])
  const [status, setStatus] = useState<'all' | 'unread' | 'read'>('all')
  const [type, setType] = useState('all')

  useEffect(() => {
    getNotifications().then(setItems)
  }, [])

  const filtered = items.filter((n) => {
    if (status === 'unread' && n.is_read) return false
    if (status === 'read' && !n.is_read) return false
    if (type !== 'all' && !n.type.startsWith(type)) return false
    return true
  })

  const handleMarkAll = async () => {
    const ids = items.filter((i) => !i.is_read).map((i) => i.id)
    await markAllNotificationsRead(ids)
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">通知</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAll}
          disabled={!items.some((n) => !n.is_read)}
        >
          一括既読化
        </Button>
      </div>
      <div className="flex gap-2 items-center">
        {['all', 'unread', 'read'].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? 'default' : 'outline'}
            onClick={() => setStatus(s as any)}
          >
            {s === 'all' ? 'すべて' : s === 'unread' ? '未読' : '既読'}
          </Button>
        ))}
        <select
          className="ml-auto border rounded px-2 py-1 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="all">全種類</option>
          <option value="offer">オファー</option>
          <option value="schedule">スケジュール</option>
          <option value="invoice">請求</option>
          <option value="payment">支払い</option>
          <option value="system">システム</option>
        </select>
      </div>
      <div className="space-y-2">
        {filtered.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onRead={(id) =>
              setItems((prev) =>
                prev.map((m) => (m.id === id ? { ...m, is_read: true } : m))
              )
            }
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">通知はありません</p>
        )}
      </div>
    </div>
  )
}

