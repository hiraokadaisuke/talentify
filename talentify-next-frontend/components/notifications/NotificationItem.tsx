'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Calendar, FileText, CreditCard, Info } from 'lucide-react'
import type { NotificationRow } from '@/utils/notifications'
import { markNotificationRead } from '@/utils/notifications'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

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
  system: Info,
}

function resolveIcon(type: string) {
  const prefix = type.split('_')[0]
  return typeIcon[prefix] || Info
}

function resolveLink(n: NotificationRow): string {
  const data = (n.data as any) || {}
  if (data.url) return data.url as string
  const id = data.offer_id || data.schedule_id || data.invoice_id || data.payment_id
  const prefix = n.type.split('_')[0]
  switch (prefix) {
    case 'offer':
      return id ? `/offers/${id}` : '/offers'
    case 'schedule':
      return '/schedule'
    case 'invoice':
      return id ? `/invoices/${id}` : '/invoices'
    case 'payment':
      return id ? `/payments/${id}` : '/payments'
    case 'system':
      return id ? `/notifications/${id}` : '/notifications'
    default:
      return '/'
  }
}

export default function NotificationItem({ notification, onRead, className }: Props) {
  const router = useRouter()
  const Icon = resolveIcon(notification.type)

  const handleClick = useCallback(async () => {
    if (!notification.is_read) {
      markNotificationRead(notification.id)
      onRead?.(notification.id)
    }
    const href = resolveLink(notification)
    router.push(href)
  }, [notification, router, onRead])

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-md p-2 text-left hover:bg-accent focus:outline-none',
        !notification.is_read && 'bg-muted/50',
        className
      )}
    >
      <Icon className="h-4 w-4 mt-0.5" />
      <div className="flex-1 text-sm">
        <p className="font-medium leading-snug">{notification.title}</p>
        {notification.body && (
          <p className="text-xs text-muted-foreground line-clamp-2">{notification.body}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ja })}
        </p>
      </div>
    </button>
  )
}

