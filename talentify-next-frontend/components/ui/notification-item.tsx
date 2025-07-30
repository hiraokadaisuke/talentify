import React from 'react'
import Link from 'next/link'
import { Badge } from './badge'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/ui'
import {
  Bell,
  Mail,
  Calendar as CalendarIcon,
  Info,
  FileText,
  CheckCircle,
} from 'lucide-react'

interface NotificationItemProps
  extends React.HTMLAttributes<HTMLAnchorElement> {
  notification: Notification
  href: string
  onRead?: () => void | Promise<void>
}

const typeIcon: Record<Notification['type'], React.ComponentType<{
  className?: string
}>> = {
  offer_accepted: Bell,
  schedule_fixed: CalendarIcon,
  contract_uploaded: FileText,
  contract_checked: CheckCircle,
  invoice_submitted: Mail,
  payment_completed: Bell,
  message: Mail,
}

export function NotificationItem({
  notification,
  href,
  onRead,
  className,
  ...props
}: NotificationItemProps) {
  const Icon = typeIcon[notification.type]

  const formatted = notification.created_at?.slice(0, 10)

  const handleClick = async () => {
    if (!notification.is_read && onRead) await onRead()
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'flex items-start gap-2 rounded-md border p-3 bg-white',
        !notification.is_read && 'font-semibold',
        className
      )}
      {...props}
    >
      <Icon className="h-4 w-4 mt-0.5" />
      <div className="text-sm flex-1">
        <div>[{notification.title}]（{formatted}）</div>
      </div>
      {!notification.is_read && (
        <Badge className="self-start" variant="destructive">
          NEW
        </Badge>
      )}
    </Link>
  )
}
