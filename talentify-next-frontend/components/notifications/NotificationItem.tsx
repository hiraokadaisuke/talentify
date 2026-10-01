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
  onNavigate?: () => void
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

function isResurfacedNotification(createdAt: string | null, updatedAt: string | null): boolean {
  if (!createdAt || !updatedAt) return false
  return new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 60_000
}

export default function NotificationItem({ notification, onRead, onNavigate, className }: Props) {
  const router = useRouter()
  const Icon = resolveIcon(notification.type)
  const isUnread = !notification.is_read
  const isHigh = notification.priority === 'high'

  const handleClick = useCallback(() => {
    onNavigate?.()

    if (!notification.is_read) {
      onRead?.(notification.id)
      void markNotificationRead(notification.id).catch((error) => {
        console.error('failed to mark notification as read', error)
      })
    }

    router.push(getNotificationLink(notification))
  }, [notification, onNavigate, onRead, router])

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition hover:bg-accent focus:outline-none',
        isUnread ? 'bg-blue-50/70 border-blue-100' : 'bg-white',
        isHigh && 'border-l-4 border-l-amber-500',
        className
      )}
    >
      <div className={cn(
        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        isHigh ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500',
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 text-sm">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('break-words font-medium leading-snug text-slate-900', isUnread && 'font-bold')}>
            {notification.title}
          </p>
          {isUnread && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" aria-label="未読" />}
        </div>
        {notification.body && (
          <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted-foreground">{notification.body}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          {notification.actor_name && (
            <span className="max-w-[10rem] truncate">{notification.actor_name}</span>
          )}
          <span>
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ja })}
          </span>
          {isResurfacedNotification(notification.created_at, notification.updated_at) && (
            <span className="rounded-full bg-amber-50 px-1.5 py-0.5 font-medium text-amber-700">
              再通知
            </span>
          )}
          <span className="basis-full font-semibold text-primary sm:ml-auto sm:basis-auto">
            {getActionLabel(notification)}
          </span>
        </div>
      </div>
    </button>
  )
}
