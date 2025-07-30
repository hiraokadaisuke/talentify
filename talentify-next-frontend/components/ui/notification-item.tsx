import React from 'react'
import Link from 'next/link'
import { Badge } from './badge'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/ui'
import {
  Bell,
  Calendar as CalendarIcon,
  FileText,
  CheckCircle,
  Wallet,
} from 'lucide-react'

interface NotificationItemProps extends React.HTMLAttributes<HTMLDivElement> {
  notification: Notification
  href?: string
  onClick?: () => void
}

const typeIcon = {
  offer_accepted: Bell,
  schedule_fixed: CalendarIcon,
  contract_uploaded: FileText,
  contract_checked: CheckCircle,
  invoice_submitted: FileText,
  payment_completed: Wallet,
} as const

export function NotificationItem({ notification, className, href, onClick, ...props }: NotificationItemProps) {
  const Icon = typeIcon[notification.type] ?? Bell

  const content = (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border p-3 bg-white',
        !notification.is_read && 'font-semibold',
        className,
      )}
      {...props}
    >
      <Icon className="h-4 w-4 mt-0.5" />
      <div className="text-sm flex-1">
        <div>{notification.title}</div>
        <div className="text-xs text-muted-foreground">{notification.created_at?.slice(0,10)}</div>
      </div>
      {!notification.is_read && (
        <Badge className="self-start" variant="destructive">
          NEW
        </Badge>
      )}
    </div>
  )

  return href ? (
    <Link href={href} onClick={onClick} className="block">
      {content}
    </Link>
  ) : (
    content
  )
}
