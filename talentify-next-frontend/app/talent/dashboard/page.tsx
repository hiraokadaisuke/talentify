'use client'

import OfferSummaryCard from '@/components/OfferSummaryCard'
import ScheduleCard, { ScheduleItem } from '@/components/ScheduleCard'
import MessageAlertCard from '@/components/MessageAlertCard'
import ProfileProgressCard from '@/components/ProfileProgressCard'

export default function TalentDashboard() {
  const pending = 2
  const schedule: ScheduleItem[] = [
    { date: '7/20', performer: 'パチンコ店A', status: 'confirmed' },
  ]
  const unread = 5

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      <ScheduleCard items={schedule} />
      <OfferSummaryCard pending={pending} accepted={schedule.length} link='/talent/offers' />
      <MessageAlertCard count={unread} link='/talent/messages' />
      <div className='sm:col-span-2 lg:col-span-3'>
        <ProfileProgressCard />
      </div>
    </div>
  )
}
