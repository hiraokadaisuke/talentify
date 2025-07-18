import React from 'react'
import { DashboardCard } from './ui/dashboard-card'
import { Badge } from './ui/badge'

interface MessageAlertCardProps {
  title?: string
  count: number
  link?: string
}

export default function MessageAlertCard({
  title = '新着メッセージ',
  count,
  link,
}: MessageAlertCardProps) {
  return (
    <DashboardCard
      title={title}
      ctaHref={link}
      ctaLabel={link ? 'メッセージを見る' : undefined}
    >
      <div className="text-sm">
        未読: <Badge variant="destructive">{count}</Badge>
      </div>
    </DashboardCard>
  )
}
