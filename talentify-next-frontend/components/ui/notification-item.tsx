import React from 'react'
import { Badge } from './badge'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/ui'
import { Bell, Mail, Calendar as CalendarIcon, Info } from 'lucide-react'

interface NotificationItemProps extends React.HTMLAttributes<HTMLDivElement> {
  notification: Notification
}

const typeIcon = {
  message: Mail,
  offer: Bell,
  offer_accepted: Bell,
  schedule_fixed: CalendarIcon,
  contract_uploaded: Info,
  contract_checked: Info,
  invoice_submitted: Info,
  payment_completed: Info,
  schedule: CalendarIcon,
  system: Info,
} as const

export function NotificationItem({ notification, className, ...props }: NotificationItemProps) {
  const Icon = typeIcon[notification.type as keyof typeof typeIcon] ?? Bell

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border p-3 bg-white',
        !notification.is_read && 'font-semibold',
        className
      )}
      {...props}
    >
      <Icon className="h-4 w-4 mt-0.5" />
      <div className="text-sm flex-1">
        <div>{notification.title}</div>
        {notification.body && (
          <div className="text-xs text-muted-foreground whitespace-pre-wrap">{notification.body}</div>
        )}
        <div className="text-xs text-muted-foreground">{notification.created_at}</div>
      </div>
      {!notification.is_read && <Badge className="self-start" variant="destructive">NEW</Badge>}
    </div>
  )
}
