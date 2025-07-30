'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getNotifications, markNotificationRead, NotificationRow } from '@/utils/notifications'

export default function TalentNotificationsPage() {
  const [items, setItems] = useState<NotificationRow[]>([])

  useEffect(() => {
    getNotifications().then(setItems)
  }, [])

  const handleClick = async (n: NotificationRow, href: string) => {
    if (!n.is_read) {
      await markNotificationRead(n.id)
      setItems((prev) => prev.map((m) => (m.id === n.id ? { ...m, is_read: true } : m)))
    }
    window.location.href = href
  }

  const linkFor = (n: NotificationRow) => {
    if (n.type === 'message') return '/messages'
    return n.offer_id ? `/talent/offers/${n.offer_id}` : '#'
  }

  return (
    <div className='max-w-screen-md mx-auto py-8 space-y-4'>
      <h1 className='text-2xl font-bold'>通知一覧</h1>
      <ul className='space-y-2'>
        {items.map((n) => (
          <li key={n.id} className={`p-3 border rounded hover:bg-gray-50 cursor-pointer ${!n.is_read ? 'font-semibold' : ''}`}
              onClick={() => handleClick(n, linkFor(n))}>
            <span>[{n.title}]（{n.created_at.slice(0,10)}）→</span>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className='text-sm text-muted-foreground'>通知はありません</p>}
    </div>
  )
}
