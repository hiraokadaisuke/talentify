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
  complete: 'text-[#00B26F]',
  current: 'text-[#1976D2]',
  upcoming: 'text-[#BDBDBD]',
}

const dateColorByStatus: Record<OfferProgressStep['status'], string> = {
  complete: 'text-[#00B26F]',
  current: 'text-[#FF9800]',
  upcoming: 'text-transparent',
}

const iconStylesByStatus: Record<OfferProgressStep['status'], { outer: string; inner: string }> = {
  complete: {
    outer: 'border-2 border-[#00B26F]',
    inner: 'bg-[#00B26F] text-white',
  },
  current: {
    outer: 'border-2 border-transparent',
    inner: 'bg-[#1976D2] text-white',
  },
  upcoming: {
    outer: 'border border-[#BDBDBD]',
    inner: 'bg-white text-[#BDBDBD]',
  },
}

export default function OfferProgressTracker({ steps, selectedStep, onStepSelect }: OfferProgressTrackerProps) {
  const activeStep =
    selectedStep ?? steps.find(step => step.status === 'current')?.key ?? steps[steps.length - 1]?.key
  const completedCount = steps.filter(step => step.status === 'complete').length
  const currentIndex = steps.findIndex(step => step.status === 'current')
  const lastCompletedIndex = steps.reduce((acc, step, index) => (step.status === 'complete' ? index : acc), -1)
  const progressTargetIndex =
    currentIndex >= 0 ? currentIndex : Math.max(lastCompletedIndex, steps.length > 0 ? 0 : -1)
  const progressPercentage = (() => {
    if (steps.length <= 1) {
      return 100
    }
    if (progressTargetIndex < 0) {
      return 0
    }
    const ratio = progressTargetIndex / (steps.length - 1)
    return Math.max(0, Math.min(100, ratio * 100))
  })()

  const getDisplaySubLabel = (step: OfferProgressStep) => {
    if (step.status === 'upcoming') {
      return ''
    }
    return step.subLabel ?? ''
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <span className="text-xs font-medium text-[#1976D2]">
          {completedCount}/{steps.length}ステップ完了
        </span>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="space-y-6">
            <div className="relative h-1 w-full rounded-full bg-[#E0E0E0]">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#1976D2] transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between gap-3">
              {steps.map((step, index) => {
                const isSelected = step.key === activeStep
                const iconStyles = iconStylesByStatus[step.status]
                const displaySubLabel = getDisplaySubLabel(step)
                return (
                  <div key={step.key} className="flex min-w-0 flex-1 flex-col items-center text-center">
                    <button
                      type="button"
                      onClick={() => onStepSelect?.(step.key)}
                      className="flex flex-col items-center gap-3 focus:outline-none"
                      aria-pressed={isSelected}
                    >
                      <div
                        className={cn(
                          'flex h-14 w-14 items-center justify-center rounded-full transition-all',
                          iconStyles.outer,
                          isSelected && 'ring-2 ring-[#1976D2] ring-opacity-60 ring-offset-2',
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-11 w-11 items-center justify-center rounded-full text-base font-semibold transition-all',
                            iconStyles.inner,
                          )}
                        >
                          {step.status === 'complete' ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex min-h-[3.5rem] flex-col items-center justify-start gap-1">
                        <span className={cn('text-sm font-semibold', titleColorByStatus[step.status])}>{step.title}</span>
                        <span className={cn('text-xs font-medium', dateColorByStatus[step.status])}>
                          {displaySubLabel ||
                            (step.status === 'current'
                              ? '期限: -'
                              : step.status === 'complete'
                                ? '-'
                                : ' ')}
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
    </div>
  )
}
