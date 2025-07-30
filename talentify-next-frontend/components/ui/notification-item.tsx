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
  schedule: CalendarIcon,
  system: Info,
}

export function NotificationItem({ notification, className, ...props }: NotificationItemProps) {
  const Icon = typeIcon[notification.type]

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
        <div>{notification.body}</div>
        <div className="text-xs text-muted-foreground">
          {typeof notification.created_at === 'string'
            ? notification.created_at.slice(0, 10)
            : String(notification.created_at)}
        </div>
      </div>
      {!notification.is_read && <Badge className="self-start" variant="destructive">NEW</Badge>}
    </div>
  )
}
