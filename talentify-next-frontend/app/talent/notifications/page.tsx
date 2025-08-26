'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  getNotifications,
  markNotificationRead,
  markNotificationUnread,
  markAllNotificationsRead,
  NotificationRow,
} from '@/utils/notifications'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'
import { Button } from '@/components/ui/button'
import { fetchStoreNamesForOffers } from '@/utils/storeName'

const typeMap: Record<string, 'offer' | 'payment' | 'schedule' | 'other'> = {
  offer_created: 'offer',
  review_received: 'other',
  payment_status: 'payment',
  schedule_changed: 'schedule',
}

export default function TalentNotificationsPage() {
  const [items, setItems] = useState<NotificationRow[]>([])
  const [filter, setFilter] = useState<'all' | 'offer' | 'payment' | 'schedule'>('all')
  const [storeNames, setStoreNames] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    const load = async () => {
      const data = await getNotifications()
      setItems(data)
      const ids = data
        .map(n => (n.data as any)?.offer_id)
        .filter((id): id is string => !!id)
      const nameMap = await fetchStoreNamesForOffers(ids)
      setStoreNames(nameMap)
    }
    load()
  }, [])

  const handleClick = async (n: NotificationRow, href: string) => {
    if (!n.is_read) {
      await markNotificationRead(n.id)
      setItems((prev) => prev.map((m) => (m.id === n.id ? { ...m, is_read: true } : m)))
    }
    window.location.href = href
  }

  const linkFor = (n: NotificationRow) => {
    if (n.type === 'message') return '/talent/messages'
    const offerId = (n.data as any)?.offer_id
    return offerId ? `/talent/offers/${offerId}` : '#'
  }

  const handleToggleRead = async (n: NotificationRow) => {
    if (n.is_read) {
      await markNotificationUnread(n.id)
    } else {
      await markNotificationRead(n.id)
    }
    setItems((prev) => prev.map((m) => (m.id === n.id ? { ...m, is_read: !n.is_read } : m)))
  }

  const handleMarkAll = async () => {
    const unreadIds = items.filter((i) => !i.is_read).map((i) => i.id)
    await markAllNotificationsRead(unreadIds)
    setItems((prev) => prev.map((m) => ({ ...m, is_read: true })))
  }

  const filtered = items.filter((n) => {
    if (filter === 'all') return true
    return typeMap[n.type] === filter
  })

  return (
    <div className="max-w-screen-md mx-auto py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">通知</h1>
        <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={!items.some((i) => !i.is_read)}>
          すべて既読
        </Button>
      </div>
      <div className="flex gap-2">
        {['all', 'offer', 'payment', 'schedule'].map((t) => (
          <Button
            key={t}
            variant={filter === t ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(t as any)}
          >
            {t === 'all' ? 'すべて' : t === 'offer' ? 'オファー' : t === 'payment' ? '支払い' : 'スケジュール'}
          </Button>
        ))}
      </div>
      <ul className="space-y-2">
        {filtered.map((n) => (
          <li
            key={n.id}
            className={`relative p-3 border rounded hover:bg-gray-50 cursor-pointer group`}
            onClick={() => handleClick(n, linkFor(n))}
          >
            {!n.is_read && <span className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500" />}
            <div className="flex justify-between items-center pl-4">
              <div>
                <p className="font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground">
                  {(n.data as any)?.offer_id ? storeNames.get((n.data as any).offer_id) ?? '-' : '-'}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-1">{n.body || '—'}</p>
              </div>
              <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                {formatJaDateTimeWithWeekday(n.created_at)}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleToggleRead(n)
              }}
              className="absolute right-3 top-3 text-xs text-blue-600 opacity-0 group-hover:opacity-100"
            >
              {n.is_read ? '未読にする' : '既読にする'}
            </button>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="text-sm text-muted-foreground">通知はありません</p>}
    </div>
  )
}

