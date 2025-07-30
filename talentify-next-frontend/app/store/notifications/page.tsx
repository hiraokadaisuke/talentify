'use client'

import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'
import { NotificationItem } from '@/components/ui/notification-item'
import type { NotificationRow } from '@/utils/getNotifications'
import { fetchNotifications, markAsRead } from '@/utils/getNotifications'

export default function StoreNotificationsPage() {
  const [items, setItems] = useState<NotificationRow[]>([])

  useEffect(() => {
    fetchNotifications().then(setItems)
  }, [])

  const handleRead = async (id: string) => {
    await markAsRead(id)
    setItems(items =>
      items.map(n => (n.id === id ? { ...n, is_read: true } : n)),
    )
  }

  const getLink = (n: NotificationRow) =>
    n.type === 'message' ? '/store/messages' : `/store/offers/${n.offer_id}`

  return (
    <div className="max-w-screen-md mx-auto py-8 space-y-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Settings className="w-6 h-6" /> 通知一覧
      </h1>
      <ul className="space-y-2">
        {items.map(n => (
          <NotificationItem
            key={n.id}
            notification={n as any}
            href={getLink(n)}
            onRead={() => handleRead(n.id)}
          />
        ))}
      </ul>
    </div>
  )
}
