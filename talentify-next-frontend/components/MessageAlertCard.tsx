import { MessageSquare } from 'lucide-react'
import { DashboardCard } from './ui/dashboard-card'

interface MessageAlertCardProps {
  title?: string
  count: number
  link?: string
}

export default function MessageAlertCard({
  title = '新着メッセージ',
  count,
  link,
}: MessageAlertCardProps) {
  return (
    <DashboardCard
      title={title}
      ctaHref={link}
      ctaLabel={link ? 'メッセージを見る' : undefined}
      ctaVariant='default'
    >
      <div className='rounded-lg border border-red-100 bg-red-50/70 p-2.5'>
        <div className='flex items-center justify-between'>
          <span className='inline-flex items-center gap-1.5 text-sm font-medium text-slate-600'>
            <MessageSquare className='h-4 w-4 text-red-500' />
            未読メッセージ
          </span>
          <span className='inline-flex min-w-10 items-center justify-center rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white'>
            {count}
          </span>
        </div>
      </div>
    </DashboardCard>
  )
}
