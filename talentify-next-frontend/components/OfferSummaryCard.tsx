import { CircleCheckBig, Clock3 } from 'lucide-react'
import { DashboardCard } from './ui/dashboard-card'
import { Badge } from './ui/badge'

interface OfferSummaryCardProps {
  title?: string
  pending: number
  confirmed: number
  link?: string
}

export default function OfferSummaryCard({
  title = '進行中のオファー',
  pending,
  confirmed,
  link,
}: OfferSummaryCardProps) {
  return (
    <DashboardCard
      title={title}
      ctaHref={link}
      ctaLabel={link ? '詳細を見る' : undefined}
      ctaVariant='default'
    >
      <div className='space-y-3'>
        <div className='rounded-lg border border-amber-100 bg-amber-50/70 p-3'>
          <div className='flex items-center justify-between text-sm text-slate-600'>
            <span className='inline-flex items-center gap-1.5 font-medium'>
              <Clock3 className='h-4 w-4 text-amber-600' />
              保留中
            </span>
            <Badge variant='secondary' className='text-sm font-semibold'>
              {pending}
            </Badge>
          </div>
        </div>
        <div className='rounded-lg border border-emerald-100 bg-emerald-50/70 p-3'>
          <div className='flex items-center justify-between text-sm text-slate-600'>
            <span className='inline-flex items-center gap-1.5 font-medium'>
              <CircleCheckBig className='h-4 w-4 text-emerald-600' />
              承認済み
            </span>
            <Badge className='text-sm font-semibold'>{confirmed}</Badge>
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}
