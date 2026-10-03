'use client'

import { useEffect, useState } from 'react'
import { DashboardCard } from '@/components/ui/dashboard-card'
import { NotificationItem } from '@/components/ui/notification-item'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/ui'
import { getRecentNotifications } from '@/utils/getRecentNotifications'

interface Props {
  title?: string
  className?: string
  initialItems?: Notification[]
  limit?: number
}

export default function NotificationListCard({
  title = '通知',
  className,
  initialItems,
  limit = 3,
}: Props) {
  const [items, setItems] = useState<Notification[] | null>(initialItems ?? null)

  useEffect(() => {
    if (initialItems !== undefined) return
    getRecentNotifications().then(setItems)
  }, [initialItems])

  return (
    <DashboardCard title={title} className={cn('space-y-2', className)}>
      {items === null && (
        <div className="text-sm text-muted-foreground">読み込み中...</div>
      )}
      {items && items.length === 0 && (
        <div className="text-sm text-muted-foreground">通知はありません</div>
      )}
      {items && items.length > 0 && (
        <div className="space-y-2">
          {items.slice(0, limit).map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      )}
    </DashboardCard>
  )
}
