'use client'

import React from 'react'
import Link from 'next/link'
import { CalendarCheck, Clock, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DashboardCard } from './ui/dashboard-card'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'

export type ScheduleStatus = 'confirmed' | 'pending' | 'cancelled'
export interface ScheduleItem {
  date: string
  performer: string
  status: ScheduleStatus
  href?: string
}

interface ScheduleCardProps {
  title?: string
  items: ScheduleItem[]
}

export default function ScheduleCard({ title = '今週の予定', items }: ScheduleCardProps) {
  return (
    <DashboardCard title={title}>
      <div className="space-y-2 text-sm">
        {items.length === 0 && <p className="text-muted-foreground">予定はありません</p>}
        {items.map((ev, i) => (
          <div key={i} className="flex justify-between items-center rounded border p-2">
            <div>
              <div>{formatJaDateTimeWithWeekday(ev.date)}</div>
              <div className="text-xs text-muted-foreground">{ev.performer}</div>
            </div>
            {ev.status === 'confirmed' && (
              <Badge className="flex items-center gap-1"><CalendarCheck className="w-4 h-4"/>確定</Badge>
            )}
            {ev.status === 'pending' && (
              <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-4 h-4"/>保留</Badge>
            )}
            {ev.status === 'cancelled' && (
              <div className="flex items-center gap-1 text-red-600 text-xs"><AlertCircle className="w-4 h-4"/>キャンセル</div>
            )}
            {ev.href && (
              <Link href={ev.href} className="text-blue-600 text-xs ml-2">詳細</Link>
            )}
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
