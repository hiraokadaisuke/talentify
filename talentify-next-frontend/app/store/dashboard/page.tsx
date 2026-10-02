import OfferSummaryCard from '@/components/OfferSummaryCard'
import ScheduleCard from '@/components/ScheduleCard'
import MessageAlertCard from '@/components/MessageAlertCard'
import { EmptyState } from '@/components/ui/empty-state'
import NotificationListCard from '@/components/NotificationListCard'
import { Card, CardHeader, CardTitle, CardFooter, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Building2, Search as SearchIcon, Sparkles } from 'lucide-react'
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
        <div className='flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6'>
          <div className='flex items-start gap-3'>
            <span className='grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#0B1F3B] text-[#FFC400]'>
              <Building2 className='h-5 w-5' />
            </span>
            <div>
              <p className='text-[11px] font-black tracking-[0.16em] text-[#C2410C]'>STORE DASHBOARD</p>
              <h1 className='mt-1 text-2xl font-black tracking-tight text-slate-950'>店舗ダッシュボード</h1>
              <p className='mt-1 text-sm leading-6 text-slate-500'>来店案件の予定・オファー・連絡状況をまとめて確認できます。</p>
            </div>
          </div>
          <Link
            href='/search'
            className='inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] px-4 text-sm font-bold text-white transition hover:bg-[#E94F18]'
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
          description='まずは演者を探して、プロフィールや予定を確認してみましょう。'
          actionHref='/search'
          actionLabel='演者を探す'
        />
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-6'>
          <Card className='sm:col-span-2 lg:col-span-6 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-white p-5 shadow-[0_8px_24px_rgba(15,23,42,.05)]'>
              <CardHeader className='mb-0 flex items-center gap-2 p-0'>
                <Sparkles className='h-5 w-5 text-[#FF5A1F]' />
                <CardTitle className='text-lg font-semibold text-slate-900'>
                  次の来店イベントを企画しませんか？
                </CardTitle>
              </CardHeader>
              <CardContent className='mt-2 p-0 text-sm leading-relaxed text-slate-600'>
                演者一覧から希望に合ったタレントを探して、集客につながるイベント企画を進めましょう。
              </CardContent>
              <CardFooter className='mt-4 p-0'>
                <Button variant='default' size='default' asChild>
                  <Link href='/search'>
                    <SearchIcon className='mr-2 h-4 w-4' /> 演者を探す
                  </Link>
                </Button>
              </CardFooter>
          </Card>

          <ScheduleCard items={schedule} className='lg:col-span-3' />
          <OfferSummaryCard
            className='lg:col-span-2'
            pending={offerStats.pending ?? 0}
            confirmed={offerStats.confirmed ?? 0}
            link='/store/offers'
          />
          <MessageAlertCard className='lg:col-span-1' count={unreadCount} link='/store/messages' />
          <NotificationListCard title='通知（最新）' className='sm:col-span-2 lg:col-span-4' initialItems={recentNotifications} />
        </div>
      )}
    </div>
  )
}
