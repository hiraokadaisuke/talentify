'use client'

import OfferSummaryCard from '@/components/OfferSummaryCard'
import ScheduleCard, { ScheduleItem } from '@/components/ScheduleCard'
import MessageAlertCard from '@/components/MessageAlertCard'
import ProfileProgressCard from '@/components/ProfileProgressCard'
import NotificationListCard from '@/components/NotificationListCard'
import { CardSkeleton } from '@/components/ui/skeleton'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getTalentSchedule } from '@/utils/getTalentSchedule'

export default function TalentDashboard() {
  const pending = 2
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const unread = 5
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    getTalentSchedule().then((data) => {
      const items: ScheduleItem[] = data.map((d) => ({
        date: d.date,
        performer: d.store_name ?? '',
        status: 'confirmed',
        href: `/talent/offers/${d.id}`,
      }))
      setSchedule(items)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (searchParams.get('saved') === '1') {
      setToast('保存しました')
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {loading ? (
        <>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton className='sm:col-span-2 lg:col-span-3' />
        </>
      ) : (
        <>
          <ScheduleCard items={schedule} />
          <OfferSummaryCard pending={pending} accepted={schedule.length} link='/talent/offers' />
          <MessageAlertCard count={unread} link='/messages' />
          <NotificationListCard className='sm:col-span-2 lg:col-span-3' />
          <div className='sm:col-span-2 lg:col-span-3'>
            <ProfileProgressCard />
          </div>
        </>
      )}
      {toast && (
        <div className='fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow'>
          {toast}
        </div>
      )}
    </div>
  )
}
