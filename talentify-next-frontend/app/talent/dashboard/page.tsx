import OfferSummaryCard from '@/components/OfferSummaryCard'
import ScheduleCard from '@/components/ScheduleCard'
import MessageAlertCard from '@/components/MessageAlertCard'
import NotificationListCard from '@/components/NotificationListCard'
import { getTalentDashboardData } from '@/lib/queries/dashboard'

export default async function TalentDashboard() {
  const { schedule, pendingOffersCount, unreadMessagesCount } = await getTalentDashboardData()

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-6'>
        <ScheduleCard items={schedule} className='lg:col-span-3' />
        <OfferSummaryCard
          className='lg:col-span-2'
          pending={pendingOffersCount}
          confirmed={schedule.length}
          link='/talent/offers'
        />
        <MessageAlertCard className='lg:col-span-1' count={unreadMessagesCount} link='/talent/messages' />
        <NotificationListCard title='通知（最新）' className='sm:col-span-2 lg:col-span-4' />
      </div>
    </div>
  )
}
