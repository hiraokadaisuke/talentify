import OfferSummaryCard from '@/components/OfferSummaryCard'
import ScheduleCard from '@/components/ScheduleCard'
import MessageAlertCard from '@/components/MessageAlertCard'
import NotificationListCard from '@/components/NotificationListCard'
import { getTalentDashboardData } from '@/lib/queries/dashboard'
import ProfileSetupBanner from '@/components/ProfileSetupBanner'
import GettingStartedCard from '@/components/GettingStartedCard'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Mic } from 'lucide-react'

export default async function TalentDashboard() {
  const { schedule, pendingOffersCount, confirmedOffersCount, unreadMessagesCount, recentNotifications, isSetupComplete } = await getTalentDashboardData()

  return (
    <div className='mx-auto w-full max-w-[1500px] space-y-4'>
      <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]'>
        <div className='flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6'>
          <div className='flex items-start gap-3'>
            <span className='grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#0B1F3B] text-[#FFC400]'>
              <Mic className='h-5 w-5' />
            </span>
            <div>
              <p className='text-[11px] font-black tracking-[0.16em] text-[#C2410C]'>TALENT DASHBOARD</p>
              <h1 className='mt-1 text-2xl font-black tracking-tight text-slate-950'>演者ダッシュボード</h1>
              <p className='mt-1 text-sm leading-6 text-slate-500'>予定・オファー・メッセージを確認して、来店案件をスムーズに進められます。</p>
            </div>
          </div>
          <Link
            href='/talent/schedule'
            className='inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] px-4 text-sm font-bold text-white transition hover:bg-[#E94F18]'
          >
            <CalendarDays className='h-4 w-4' />
            スケジュールを確認
            <ArrowRight className='h-4 w-4' />
          </Link>
        </div>
        <div className='h-1 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]' />
      </section>

      <ProfileSetupBanner role='talent' isSetupComplete={isSetupComplete} />
      <GettingStartedCard role='talent' />
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-6'>
        <ScheduleCard items={schedule} className='lg:col-span-3' />
        <OfferSummaryCard
          className='lg:col-span-2'
          pending={pendingOffersCount}
          confirmed={confirmedOffersCount}
          link='/talent/offers'
        />
        <MessageAlertCard className='lg:col-span-1' count={unreadMessagesCount} link='/talent/messages' />
        <NotificationListCard title='通知（最新）' className='sm:col-span-2 lg:col-span-4' initialItems={recentNotifications} />
      </div>
    </div>
  )
}
