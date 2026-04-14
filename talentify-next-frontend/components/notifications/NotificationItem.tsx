'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Calendar, FileText, CreditCard, Info } from 'lucide-react'
import type { NotificationRow } from '@/utils/notifications'
import { markNotificationRead } from '@/utils/notifications'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { getActionLabel, getNotificationLink } from './notification-meta'

interface Props {
  notification: NotificationRow
  onRead?: (id: string) => void
  className?: string
}

const typeIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  offer: Bell,
  schedule: Calendar,
  invoice: FileText,
  payment: CreditCard,
  message: Bell,
  system: Info,
}

function resolveIcon(type: string) {
  const prefix = type.split('_')[0]
  return typeIcon[prefix] || Info
}

export default function NotificationItem({ notification, onRead, className }: Props) {
  const router = useRouter()
  const Icon = resolveIcon(notification.type)
  const isUnread = !notification.is_read
  const isHigh = notification.priority === 'high'

  const handleClick = useCallback(async () => {
    if (!notification.is_read) {
      await markNotificationRead(notification.id)
      onRead?.(notification.id)
    }
    router.push(getNotificationLink(notification))
  }, [notification, onRead, router])

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative flex w-full items-start gap-3 rounded-md border p-3 text-left transition hover:bg-accent focus:outline-none',
        isUnread ? 'bg-blue-50/70 border-blue-100' : 'bg-white',
        isHigh && 'border-l-4 border-l-amber-500',
        className
      )}
    >
      <Icon className={cn('h-4 w-4 mt-0.5', isHigh ? 'text-amber-600' : 'text-muted-foreground')} />
      <div className="flex-1 min-w-0 text-sm">
        <div className="flex items-center justify-between gap-2">
          <p className={cn('leading-snug truncate', isUnread && 'font-semibold')}>{notification.title}</p>
          {isUnread && <span className="h-2.5 w-2.5 rounded-full bg-blue-500" aria-label="未読" />}
        </div>
        {notification.body && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{notification.body}</p>
        )}
        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          {notification.actor_name && <span>{notification.actor_name}</span>}
          <span>
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ja })}
          </span>
          <span className="ml-auto text-primary">{getActionLabel(notification)}</span>
        </div>
      </div>
    </button>
  )
}
