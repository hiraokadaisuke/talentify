'use client'

import OfferSummaryCard from '@/components/OfferSummaryCard'
import ScheduleCard, { ScheduleItem } from '@/components/ScheduleCard'
import MessageAlertCard from '@/components/MessageAlertCard'
import { EmptyState } from '@/components/ui/empty-state'
import NotificationListCard from '@/components/NotificationListCard'
import { CardSkeleton } from '@/components/ui/skeleton'
import { useEffect, useState } from 'react'

export default function StoreDashboard() {
  const offerStats = { pending: 1, accepted: 2 }
  const schedule: ScheduleItem[] = [
    { date: '7/22', performer: 'タレントA', status: 'confirmed', href: '#' },
  ]
  const unread = 3
  const [loading, setLoading] = useState(true)

  const hasData = offerStats.pending + offerStats.accepted > 0

  useEffect(() => {
    setTimeout(() => setLoading(false), 500)
  }, [])

  return (
    <div className='space-y-4'>
      {loading ? (
        <div className='grid gap-4 sm:grid-cols-2'>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton className='sm:col-span-2' />
          <CardSkeleton className='sm:col-span-2' />
        </div>
      ) : !hasData ? (
        <EmptyState title='まだオファーがありません' actionHref='/talent-search' actionLabel='オファーを送ってみましょう' />
      ) : (
        <div className='grid gap-4 sm:grid-cols-2'>
          <ScheduleCard items={schedule} />
          <OfferSummaryCard pending={offerStats.pending} accepted={offerStats.accepted} link='/store/offers' />
          <div className='sm:col-span-2'>
            <MessageAlertCard count={unread} link='/store/messages' />
          </div>
          <NotificationListCard className='sm:col-span-2' />
        </div>
      )}
    </div>
  )
}
