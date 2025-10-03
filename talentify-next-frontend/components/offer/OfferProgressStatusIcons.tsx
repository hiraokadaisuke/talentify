'use client'

import type { ReactNode } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import type { OfferProgressBadge, OfferProgressStep } from '@/utils/offerProgress'
import { OFFER_STEP_LABELS } from '@/utils/offerProgress'
import { cn } from '@/lib/utils'

const statusLabel: Record<OfferProgressStep['status'], string> = {
  complete: '完了',
  current: '進行中',
  upcoming: '未了',
}

const baseCircleStyles = 'flex h-8 w-8 items-center justify-center rounded-full'

const iconContainerStyles: Record<OfferProgressStep['status'], string> = {
  complete: 'bg-[#E8F5EE] text-[#16A34A]',
  current: 'bg-[#E8F1FD] text-[#3B82F6]',
  upcoming: 'bg-[#EEF2F7] text-slate-400',
}

const iconByStatus: Record<OfferProgressStep['status'], ReactNode> = {
  complete: <Check className="h-4 w-4" strokeWidth={2.2} />,
  current: <ArrowRight className="h-4 w-4" strokeWidth={2.2} />,
  upcoming: <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]" />,
}

const STEP_SHORT_LABELS: Record<OfferProgressStep['key'], string> = {
  offer_submitted: '提出',
  approval: '承認',
  visit: '来店',
  invoice: '請求',
  payment: '支払い',
  review: 'レビュー',
}

type OfferProgressStatusIconsProps = {
  steps: OfferProgressStep[]
  badge: OfferProgressBadge
  className?: string
}

const badgeVariantStyles: Record<OfferProgressBadge['variant'], string> = {
  default: 'border-blue-200 text-blue-700 bg-blue-50',
  secondary: 'border-slate-200 text-slate-600 bg-white',
  success: 'border-emerald-200 text-emerald-600 bg-emerald-50',
}

export function OfferProgressStatusIcons({ steps, badge, className }: OfferProgressStatusIconsProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          'grid gap-3 md:grid-cols-[160px_minmax(0,1fr)] md:items-center md:gap-6',
          className,
        )}
      >
        <div className="w-full md:w-[160px]">
          <Badge
            variant="outline"
            className={cn('w-full truncate', badgeVariantStyles[badge.variant])}
            title={badge.label}
          >
            {badge.label}
          </Badge>
        </div>
        <div className="grid grid-cols-6 gap-4 md:gap-6">
          {steps.map(step => (
            <Tooltip key={step.key}>
              <TooltipTrigger asChild>
                <span
                  className="flex flex-col items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30 focus-visible:ring-offset-2"
                  tabIndex={0}
                >
                  <span
                    className={cn(baseCircleStyles, iconContainerStyles[step.status])}
                    aria-label={`${OFFER_STEP_LABELS[step.key]}: ${statusLabel[step.status]}`}
                  >
                    {iconByStatus[step.status]}
                    <span className="sr-only">
                      {OFFER_STEP_LABELS[step.key]}: {statusLabel[step.status]}
                    </span>
                  </span>
                  <span className="mt-1 text-[11px] font-medium text-slate-500">
                    {STEP_SHORT_LABELS[step.key]}
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent
                role="tooltip"
                className="z-50 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-md"
              >
                <div className="font-semibold text-slate-900">{OFFER_STEP_LABELS[step.key]}</div>
                <div className="text-slate-600">{statusLabel[step.status]}</div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
