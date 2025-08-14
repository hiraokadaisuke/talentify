import OfferSummaryCard from '@/components/OfferSummaryCard'
import ScheduleCard from '@/components/ScheduleCard'
import MessageAlertCard from '@/components/MessageAlertCard'
import { EmptyState } from '@/components/ui/empty-state'
import NotificationListCard from '@/components/NotificationListCard'
import { Card, CardHeader, CardTitle, CardFooter, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Search as SearchIcon } from 'lucide-react'
import { getStoreDashboardData } from '@/lib/queries/dashboard'

export default async function StoreDashboard() {
  const { offerStats, schedule, unreadCount } = await getStoreDashboardData()
  const hasData = Object.values(offerStats).reduce((acc, v) => acc + v, 0) > 0

  return (
    <div className='space-y-4'>
      {!hasData ? (
        <EmptyState
          title='まだオファーがありません'
          actionHref='/search'
          actionLabel='オファーを送ってみましょう'
        />
      ) : (
        <div className='grid gap-4 sm:grid-cols-2'>
          <Card className='sm:col-span-2'>
            <CardHeader>
              <CardTitle>次の来店イベントを企画しませんか？</CardTitle>
            </CardHeader>
            <CardContent className='text-sm text-muted-foreground'>
              演者一覧から希望に合ったタレントを探しましょう。
            </CardContent>
            <CardFooter>
              <Button variant='default' size='lg' asChild>
                <Link href='/search'>
                  <SearchIcon className='mr-2' /> 演者を探す
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
          <NotificationListCard className='sm:col-span-2' />
        </div>
      )}
    </div>
  )
}
