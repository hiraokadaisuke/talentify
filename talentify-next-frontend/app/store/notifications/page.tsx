'use client'

import { useEffect, useState } from 'react'
import { NotificationItem } from '@/components/ui/notification-item'
import { getNotifications, markNotificationRead } from '@/utils/getNotifications'
import type { Notification } from '@/types/ui'

export default function StoreNotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotifications().then(data => {
      setItems(data)
      setLoading(false)
    })
  }, [])

  const handleRead = async (id: string) => {
    await markNotificationRead(id)
    setItems(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)))
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">通知一覧</h1>
      {loading ? (
        <p>読み込み中...</p>
      ) : items.length === 0 ? (
        <p>通知はありません</p>
      ) : (
        <ul className="space-y-2">
          {items.map(n => (
            <li key={n.id}>
              <NotificationItem
                notification={n}
                href={n.offer_id ? `/store/offers/${n.offer_id}` : undefined}
                onClick={() => handleRead(n.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
