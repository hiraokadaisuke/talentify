import ScheduleCard from '@/components/ScheduleCard'
import NotificationListCard from '@/components/NotificationListCard'
import DashboardStatusCard from '@/components/DashboardStatusCard'
import { getTalentDashboardData } from '@/lib/queries/dashboard'
import ProfileSetupBanner from '@/components/ProfileSetupBanner'
import GettingStartedCard from '@/components/GettingStartedCard'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Mic } from 'lucide-react'

export default async function TalentDashboard() {
  const { schedule, pendingOffersCount, confirmedOffersCount, unreadMessagesCount, recentNotifications, onboardingSteps, isSetupComplete } = await getTalentDashboardData()

  return (
    <div className='mx-auto w-full max-w-[1500px] space-y-4 lg:space-y-5'>
      <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]'>
        <div className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 lg:p-6'>
          <div className='flex items-start gap-3'>
            <span className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0B1F3B] text-[#FFC400]'>
              <Mic className='h-5 w-5' />
            </span>
            <div>
              <p className='text-[11px] font-black tracking-[0.16em] text-[#C2410C]'>TALENT DASHBOARD</p>
              <h1 className='mt-0.5 text-xl font-black tracking-tight text-slate-950 sm:text-2xl'>演者ダッシュボード</h1>
              <p className='mt-1 text-xs leading-5 text-slate-500 sm:text-sm'>予定・オファー・メッセージをまとめて確認できます。</p>
            </div>
          </div>
          <Link
            href='/talent/schedule'
            className='inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] px-4 text-sm font-bold text-white transition hover:bg-[#E94F18]'
          >
            <CalendarDays className='h-4 w-4' />
            スケジュールを確認
            <ArrowRight className='h-4 w-4' />
          </Link>
        </div>
        <div className='h-1 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]' />
      </section>

      <ProfileSetupBanner role='talent' isSetupComplete={isSetupComplete} />
      <GettingStartedCard role='talent' initialSteps={onboardingSteps} />
      <div className='grid gap-3 lg:gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(340px,.8fr)]'>
        <ScheduleCard items={schedule} />
        <DashboardStatusCard
          pending={pendingOffersCount}
          confirmed={confirmedOffersCount}
          unread={unreadMessagesCount}
          offersLink='/talent/offers'
          messagesLink='/talent/messages'
        />
        <NotificationListCard
          title='通知（最新）'
          className='lg:col-span-2'
          initialItems={recentNotifications}
          limit={2}
        />
      </div>
    </div>
  )
}
