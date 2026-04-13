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
  complete: 'text-[#2f4da0]',
  current: 'text-[#2f4da0]',
  upcoming: 'text-[#64748b]',
}

const dateColorByStatus: Record<OfferProgressStep['status'], string> = {
  complete: 'text-[#64748b]',
  current: 'text-[#64748b]',
  upcoming: 'text-[#64748b]',
}

const iconStylesByStatus: Record<OfferProgressStep['status'], { outer: string; inner: string }> = {
  complete: {
    outer: 'border-2 border-[#2f4da0]',
    inner: 'bg-[#2f4da0] text-white',
  },
  current: {
    outer: 'border-2 border-transparent',
    inner: 'bg-[#2f4da0] text-white',
  },
  upcoming: {
    outer: 'border border-[#e2e8f0]',
    inner: 'bg-white text-[#94a3b8]',
  },
}

export default function OfferProgressTracker({ steps, selectedStep, onStepSelect }: OfferProgressTrackerProps) {
  const activeStep =
    selectedStep ?? steps.find(step => step.status === 'current')?.key ?? steps[steps.length - 1]?.key
  const completedCount = steps.filter(step => step.status === 'complete').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <span className="text-xs font-medium text-[#64748b]">
          {completedCount}/{steps.length}ステップ完了
        </span>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[620px] space-y-4">
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
                      style={{ backgroundColor: leftConnectorActive ? '#2f4da0' : '#e2e8f0' }}
                      aria-hidden="true"
                    />
                  )}
                  {index < steps.length - 1 && (
                    <span
                      className="absolute right-0 top-6 block h-1 w-1/2 -translate-y-1/2 rounded-full"
                      style={{ backgroundColor: rightConnectorActive ? '#2f4da0' : '#e2e8f0' }}
                      aria-hidden="true"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => onStepSelect?.(step.key)}
                    className="flex flex-col items-center gap-2 focus:outline-none"
                    aria-pressed={isSelected}
                  >
                    <div
                      className={cn(
                        'relative z-10 flex h-12 w-12 items-center justify-center rounded-full transition-all',
                        iconStyles.outer,
                        isSelected && 'ring-2 ring-[#2f4da0] ring-opacity-35 ring-offset-2',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all',
                          iconStyles.inner,
                        )}
                      >
                        {step.status === 'complete' ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex min-h-[3rem] flex-col items-center justify-start gap-0.5">
                      <span className={cn('text-xs font-semibold sm:text-sm', titleColorByStatus[step.status])}>{step.title}</span>
                      <span className={cn('text-[11px] font-medium sm:text-xs', dateColorByStatus[step.status])}>
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
    </div>
  )
}
