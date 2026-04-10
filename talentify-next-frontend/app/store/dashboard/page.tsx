import OfferSummaryCard from '@/components/OfferSummaryCard'
import ScheduleCard from '@/components/ScheduleCard'
import MessageAlertCard from '@/components/MessageAlertCard'
import { EmptyState } from '@/components/ui/empty-state'
import NotificationListCard from '@/components/NotificationListCard'
import { Card, CardHeader, CardTitle, CardFooter, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Search as SearchIcon, Sparkles } from 'lucide-react'
import { getStoreDashboardData } from '@/lib/queries/dashboard'

export default async function StoreDashboard() {
  const { offerStats, schedule, unreadCount } = await getStoreDashboardData()
  const hasData =
    (Object.values(offerStats) as number[]).reduce((acc, v) => acc + v, 0) > 0

  return (
    <div className='rounded-2xl bg-slate-50 p-4 sm:p-6'>
      <div className='space-y-5'>
        {!hasData ? (
          <EmptyState
            title='まだオファーがありません'
            actionHref='/search'
            actionLabel='オファーを送ってみましょう'
          />
        ) : (
          <div className='grid gap-5 sm:grid-cols-2'>
            <Card className='sm:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60'>
              <CardHeader className='mb-0 flex items-center gap-2 p-0'>
                <Sparkles className='h-5 w-5 text-blue-600' />
                <CardTitle className='text-xl font-semibold text-slate-900'>
                  次の来店イベントを企画しませんか？
                </CardTitle>
              </CardHeader>
              <CardContent className='mt-3 p-0 text-sm leading-relaxed text-slate-600'>
                演者一覧から希望に合ったタレントを探して、集客につながるイベント企画を進めましょう。
              </CardContent>
              <CardFooter className='mt-5 p-0'>
                <Button variant='default' size='lg' asChild>
                  <Link href='/search'>
                    <SearchIcon className='mr-2 h-4 w-4' /> 演者を探す
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <ScheduleCard items={schedule} />
            <OfferSummaryCard
              pending={offerStats.pending ?? 0}
              confirmed={offerStats.confirmed ?? 0}
              link='/store/offers'
            />
            <div className='sm:col-span-2'>
              <MessageAlertCard count={unreadCount} link='/store/messages' />
            </div>
            <NotificationListCard title='通知（最新）' className='sm:col-span-2' />
          </div>
        )}
      </div>
    </div>
  )
}
