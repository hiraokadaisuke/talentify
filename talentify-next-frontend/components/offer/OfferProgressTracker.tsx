'use client'

import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { OfferProgressStep, OfferStepKey } from '@/utils/offerProgress'

interface OfferProgressTrackerProps {
  steps: OfferProgressStep[]
  selectedStep?: OfferStepKey
  onStepSelect?: (step: OfferStepKey) => void
}

const titleColorByStatus: Record<OfferProgressStep['status'], string> = {
  complete: 'text-[#0B1F3B]',
  current: 'text-[#FF5A1F]',
  upcoming: 'text-[#64748b]',
}

const dateColorByStatus: Record<OfferProgressStep['status'], string> = {
  complete: 'text-[#64748b]',
  current: 'text-[#64748b]',
  upcoming: 'text-[#64748b]',
}

const iconStylesByStatus: Record<OfferProgressStep['status'], { outer: string; inner: string }> = {
  complete: { outer: 'border-2 border-[#0B1F3B]', inner: 'bg-[#0B1F3B] text-white' },
  current: { outer: 'border-2 border-[#FF8A00]', inner: 'bg-[#FF5A1F] text-white' },
  upcoming: { outer: 'border border-[#e2e8f0]', inner: 'bg-white text-[#94a3b8]' },
}

export default function OfferProgressTracker({ steps, selectedStep, onStepSelect }: OfferProgressTrackerProps) {
  const activeStep =
    selectedStep ?? steps.find(step => step.status === 'current')?.key ?? steps[steps.length - 1]?.key
  const completedCount = steps.filter(step => step.status === 'complete').length

  return (
    <div className="min-w-0 space-y-1.5 sm:space-y-3">
      <div className="flex items-center justify-end">
        <span className="text-xs font-medium text-[#64748b]">
          {completedCount}/{steps.length} 完了
        </span>
      </div>

      <div className="space-y-0 sm:hidden">
        {steps.map((step, index) => {
          const isSelected = step.key === activeStep
          const iconStyles = iconStylesByStatus[step.status]
          const connectorActive = step.status === 'complete'
          return (
            <div key={step.key} className="relative">
              {index < steps.length - 1 && (
                <span
                  className={cn(
                    'absolute left-[15px] top-8 h-[calc(100%-1rem)] w-0.5',
                    connectorActive ? 'bg-[#0B1F3B]' : 'bg-slate-200',
                  )}
                  aria-hidden="true"
                />
              )}
              <button
                type="button"
                onClick={() => onStepSelect?.(step.key)}
                className={cn(
                  'relative z-10 flex w-full items-start gap-2 rounded-xl px-1.5 py-1 text-left transition-colors',
                  isSelected ? 'bg-orange-50' : 'hover:bg-slate-50',
                )}
                aria-pressed={isSelected}
              >
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white',
                    iconStyles.outer,
                    isSelected && 'ring-2 ring-[#FF8A00]/25 ring-offset-1',
                  )}
                >
                  <div className={cn('flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold', iconStyles.inner)}>
                    {step.status === 'complete' ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </div>
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className={cn('text-sm font-semibold', titleColorByStatus[step.status])}>{step.title}</div>
                  {step.subLabel ? (
                    <div className={cn('mt-0.5 line-clamp-1 break-words text-[11px] leading-4', dateColorByStatus[step.status])}>
                      {step.subLabel}
                    </div>
                  ) : null}
                </div>
              </button>
            </div>
          )
        })}
      </div>

      <div className="hidden sm:block">
        <div className="flex justify-between gap-2.5">
          {steps.map((step, index) => {
            const isSelected = step.key === activeStep
            const iconStyles = iconStylesByStatus[step.status]
            const displaySubLabel = step.subLabel ?? ''
            const prevStep = steps[index - 1]
            const nextStep = steps[index + 1]
            const leftConnectorActive = prevStep ? prevStep.status === 'complete' : false
            const rightConnectorActive = nextStep ? step.status === 'complete' : false

            return (
              <div key={step.key} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
                {index > 0 && (
                  <span
                    className="absolute left-0 top-6 block h-1 w-1/2 -translate-y-1/2 rounded-full"
                    style={{ backgroundColor: leftConnectorActive ? '#0B1F3B' : '#e2e8f0' }}
                    aria-hidden="true"
                  />
                )}
                {index < steps.length - 1 && (
                  <span
                    className="absolute right-0 top-6 block h-1 w-1/2 -translate-y-1/2 rounded-full"
                    style={{ backgroundColor: rightConnectorActive ? '#0B1F3B' : '#e2e8f0' }}
                    aria-hidden="true"
                  />
                )}
                <button
                  type="button"
                  onClick={() => onStepSelect?.(step.key)}
                  className="flex min-w-0 flex-col items-center gap-2 focus:outline-none"
                  aria-pressed={isSelected}
                >
                  <div
                    className={cn(
                      'relative z-10 flex h-12 w-12 items-center justify-center rounded-full transition-all',
                      iconStyles.outer,
                      isSelected && 'ring-2 ring-[#FF8A00] ring-opacity-35 ring-offset-2',
                    )}
                  >
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all', iconStyles.inner)}>
                      {step.status === 'complete' ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
                    </div>
                  </div>
                  <div className="flex min-h-[3rem] min-w-0 flex-col items-center justify-start gap-0.5">
                    <span className={cn('text-xs font-semibold sm:text-sm', titleColorByStatus[step.status])}>{step.title}</span>
                    <span className={cn('max-w-full break-words text-[11px] font-medium sm:text-xs', dateColorByStatus[step.status])}>
                      {displaySubLabel || ' '}
                    </span>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
