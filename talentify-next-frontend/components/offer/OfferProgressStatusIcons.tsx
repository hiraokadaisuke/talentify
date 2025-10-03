'use client'

import type { ReactNode } from 'react'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { OfferProgressStep } from '@/utils/offerProgress'
import { OFFER_STEP_LABELS } from '@/utils/offerProgress'
import { cn } from '@/lib/utils'

const statusLabel: Record<OfferProgressStep['status'], string> = {
  complete: '完了',
  current: '進行中',
  upcoming: '未了',
}

const iconContainerStyles: Record<OfferProgressStep['status'], string> = {
  complete:
    'border-[#16A34A] bg-[#16A34A]/10 text-[#16A34A] shadow-[0_0_0_1px_rgba(22,163,74,0.15)]',
  current: 'border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB] shadow-[0_0_0_1px_rgba(37,99,235,0.15)]',
  upcoming: 'border-[#CBD5E1] bg-white text-[#CBD5E1]',
}

const iconByStatus: Record<OfferProgressStep['status'], ReactNode> = {
  complete: <CheckCircle2 className="h-5 w-5" strokeWidth={2.2} />,
  current: <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.2} />,
  upcoming: <Circle className="h-3 w-3 fill-current" strokeWidth={2.2} />,
}

type OfferProgressStatusIconsProps = {
  steps: OfferProgressStep[]
  className?: string
}

export function OfferProgressStatusIcons({ steps, className }: OfferProgressStatusIconsProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn('grid grid-cols-6 gap-2 sm:gap-3', className)}>
        {steps.map(step => (
          <Tooltip key={step.key}>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
                  iconContainerStyles[step.status],
                )}
                aria-label={`${OFFER_STEP_LABELS[step.key]}: ${statusLabel[step.status]}`}
              >
                {iconByStatus[step.status]}
                <span className="sr-only">
                  {OFFER_STEP_LABELS[step.key]}: {statusLabel[step.status]}
                </span>
              </span>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              <div className="font-semibold text-slate-900">{OFFER_STEP_LABELS[step.key]}</div>
              <div className="text-slate-500">{statusLabel[step.status]}</div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
