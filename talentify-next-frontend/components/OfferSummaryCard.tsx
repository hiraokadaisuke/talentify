import React from 'react'
import Link from 'next/link'
import { DashboardCard } from './ui/dashboard-card'
import { Badge } from './ui/badge'

interface OfferSummaryCardProps {
  title?: string
  pending: number
  confirmed: number
  link?: string
}

export default function OfferSummaryCard({
  title = '進行中のオファー',
  pending,
  confirmed,
  link,
}: OfferSummaryCardProps) {
  return (
    <DashboardCard
      title={title}
      ctaHref={link}
      ctaLabel={link ? '詳細を見る' : undefined}
    >
      <div className="text-sm space-y-1">
        <div>
          保留中: <Badge variant="secondary">{pending}</Badge>
        </div>
        <div>
          承認済み: <Badge>{confirmed}</Badge>
        </div>
      </div>
    </DashboardCard>
  )
}
