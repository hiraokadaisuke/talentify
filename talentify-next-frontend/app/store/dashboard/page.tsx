import ScheduleCard from '@/components/ScheduleCard'
import { EmptyState } from '@/components/ui/empty-state'
import NotificationListCard from '@/components/NotificationListCard'
import DashboardStatusCard from '@/components/DashboardStatusCard'
import Link from 'next/link'
import { ArrowRight, Building2, Search as SearchIcon } from 'lucide-react'
import { getStoreDashboardData } from '@/lib/queries/dashboard'
import ProfileSetupBanner from '@/components/ProfileSetupBanner'
import GettingStartedCard from '@/components/GettingStartedCard'

export default async function StoreDashboard() {
  const { offerStats, schedule, unreadCount, recentNotifications, onboardingSteps, isSetupComplete } = await getStoreDashboardData()
  const hasData =
    (Object.values(offerStats) as number[]).reduce((acc, v) => acc + v, 0) > 0

  return (
    <div className='mx-auto w-full max-w-[1500px] space-y-4'>
      <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]'>
        <div className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5'>
          <div className='flex items-start gap-3'>
            <span className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0B1F3B] text-[#FFC400]'>
              <Building2 className='h-5 w-5' />
            </span>
            <div>
              <p className='text-[11px] font-black tracking-[0.16em] text-[#C2410C]'>STORE DASHBOARD</p>
              <h1 className='mt-0.5 text-xl font-black tracking-tight text-slate-950 sm:text-2xl'>店舗ダッシュボード</h1>
              <p className='mt-1 text-xs leading-5 text-slate-500 sm:text-sm'>予定・オファー・メッセージをまとめて確認できます。</p>
            </div>
          </div>
          <Link
            href='/search'
            className='inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] px-4 text-sm font-bold text-white transition hover:bg-[#E94F18]'
          >
            <SearchIcon className='h-4 w-4' />
            演者を探す
            <ArrowRight className='h-4 w-4' />
          </Link>
        </div>
        <div className='h-1 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]' />
      </section>

      <ProfileSetupBanner role='store' isSetupComplete={isSetupComplete} />
      <GettingStartedCard role='store' initialSteps={onboardingSteps} />
      {!hasData ? (
        <EmptyState
          title='まだ来店案件がありません'
          description='上の「演者を探す」から、プロフィールや予定を確認してオファーを始められます。'
          className='px-5 py-6'
        />
      ) : (
        <div className='grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,.8fr)]'>
          <ScheduleCard items={schedule} />
          <DashboardStatusCard
            pending={offerStats.pending ?? 0}
            confirmed={offerStats.confirmed ?? 0}
            unread={unreadCount}
            offersLink='/store/offers'
            messagesLink='/store/messages'
          />
          <NotificationListCard
            title='通知（最新）'
            className='lg:col-span-2'
            initialItems={recentNotifications}
            limit={2}
          />
        </div>
      )}
    </div>
  )
}
