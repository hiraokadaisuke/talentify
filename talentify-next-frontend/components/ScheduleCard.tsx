'use client'

import Link from 'next/link'
import { CalendarCheck, Clock, AlertCircle, ChevronRight } from 'lucide-react'
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
      <div className='space-y-3 text-sm'>
        {items.length === 0 && <p className='text-muted-foreground'>予定はありません</p>}
        {items.map((ev, i) => (
          <div
            key={i}
            className='flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3'
          >
            <div className='min-w-0 flex-1'>
              <div className='font-medium text-slate-800'>{formatJaDateTimeWithWeekday(ev.date)}</div>
              <div className='truncate text-xs text-muted-foreground'>{ev.performer}</div>
            </div>

            {ev.status === 'confirmed' && (
              <Badge className='inline-flex items-center gap-1'>
                <CalendarCheck className='h-4 w-4' />確定
              </Badge>
            )}
            {ev.status === 'pending' && (
              <Badge variant='secondary' className='inline-flex items-center gap-1'>
                <Clock className='h-4 w-4' />保留
              </Badge>
            )}
            {ev.status === 'cancelled' && (
              <div className='inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600'>
                <AlertCircle className='h-3.5 w-3.5' />キャンセル
              </div>
            )}

            {ev.href && (
              <Link
                href={ev.href}
                className='inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700'
              >
                詳細
                <ChevronRight className='h-3.5 w-3.5' />
              </Link>
            )}
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
