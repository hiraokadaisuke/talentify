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
  complete: 'bg-[#16A34A] text-white',
  current: 'bg-[#2563EB] text-white',
  upcoming: 'bg-slate-200 text-slate-500',
}

const iconByStatus: Record<OfferProgressStep['status'], ReactNode> = {
  complete: <Check className="h-4 w-4" strokeWidth={2.2} />,
  current: <ArrowRight className="h-4 w-4" strokeWidth={2.2} />,
  upcoming: <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />,
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

export function OfferProgressStatusIcons({ steps, badge, className }: OfferProgressStatusIconsProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn('flex items-start gap-3', className)}>
        <Badge variant={badge.variant} className="shrink-0">
          {badge.label}
        </Badge>
        <div className="grid flex-1 grid-cols-6 gap-2 sm:gap-3">
          {steps.map(step => (
            <Tooltip key={step.key}>
              <TooltipTrigger asChild>
                <span className="flex flex-col items-center gap-1">
                  <span
                    className={cn(baseCircleStyles, iconContainerStyles[step.status])}
                    aria-label={`${OFFER_STEP_LABELS[step.key]}: ${statusLabel[step.status]}`}
                  >
                    {iconByStatus[step.status]}
                    <span className="sr-only">
                      {OFFER_STEP_LABELS[step.key]}: {statusLabel[step.status]}
                    </span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">{STEP_SHORT_LABELS[step.key]}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                <div className="font-semibold text-slate-900">{OFFER_STEP_LABELS[step.key]}</div>
                <div className="text-slate-500">{statusLabel[step.status]}</div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
