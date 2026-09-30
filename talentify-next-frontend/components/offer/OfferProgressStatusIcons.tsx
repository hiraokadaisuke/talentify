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
  complete: 'bg-[#eef2ff] text-[#2f4da0] ring-1 ring-[#2f4da0]/35',
  current: 'bg-[#eef2ff] text-[#2f4da0] ring-1 ring-[#2f4da0]/35',
  upcoming: 'bg-white text-[#64748b] ring-1 ring-[#e2e8f0]',
}

const iconByStatus: Record<OfferProgressStep['status'], ReactNode> = {
  complete: <Check className="h-4 w-4" strokeWidth={2.2} />,
  current: <ArrowRight className="h-4 w-4" strokeWidth={2.2} />,
  upcoming: <span className="h-1.5 w-1.5 rounded-full bg-[#94a3b8]" />,
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
  default: 'border-[#2f4da0]/35 text-[#2f4da0] bg-[#eef2ff]',
  secondary: 'border-[#e2e8f0] text-[#64748b] bg-white',
  success: 'border-[#1f6b4f]/35 text-[#1f6b4f] bg-[#ecfdf3]',
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
          className={cn('w-full truncate justify-center rounded-md py-1 font-semibold', badgeVariantStyles[badge.variant])}
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
                  className="flex flex-col items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2f4da0]/35 focus-visible:ring-offset-2"
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
                  <span className="mt-1 text-[11px] font-medium text-[#64748b]">
                    {STEP_SHORT_LABELS[step.key]}
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent
                role="tooltip"
                className="z-50 rounded-md border border-[#e2e8f0] bg-white px-2 py-1 text-xs text-[#334155] shadow-md"
              >
                <div className="font-semibold text-[#334155]">{OFFER_STEP_LABELS[step.key]}</div>
                <div className="text-[#64748b]">{statusLabel[step.status]}</div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
