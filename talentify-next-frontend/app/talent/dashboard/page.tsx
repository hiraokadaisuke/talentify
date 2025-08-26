import OfferSummaryCard from '@/components/OfferSummaryCard'
import ScheduleCard from '@/components/ScheduleCard'
import MessageAlertCard from '@/components/MessageAlertCard'
import ProfileProgressCard from '@/components/ProfileProgressCard'
import NotificationListCard from '@/components/NotificationListCard'
import { getTalentDashboardData } from '@/lib/queries/dashboard'

export default async function TalentDashboard() {
  const { schedule, pendingOffersCount, unreadMessagesCount } = await getTalentDashboardData()

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      <ScheduleCard items={schedule} />
      <OfferSummaryCard
        pending={pendingOffersCount}
        confirmed={schedule.length}
        link='/talent/offers'
      />
      <MessageAlertCard count={unreadMessagesCount} link='/talents/messages' />
      <NotificationListCard className='sm:col-span-2 lg:col-span-3' />
      <div className='sm:col-span-2 lg:col-span-3'>
        <ProfileProgressCard />
      </div>
    </div>
  )
}
