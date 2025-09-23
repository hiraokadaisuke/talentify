'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OfferProgressStep, OfferStepKey } from '@/utils/offerProgress'

interface OfferProgressTrackerProps {
  steps: OfferProgressStep[]
  selectedStep?: OfferStepKey
  onStepSelect?: (step: OfferStepKey) => void
}

const stepStatusStyles: Record<OfferProgressStep['status'], string> = {
  complete: 'bg-primary text-primary-foreground border-primary',
  current: 'border-2 border-primary text-primary',
  upcoming: 'border border-border text-muted-foreground',
}

export default function OfferProgressTracker({ steps, selectedStep, onStepSelect }: OfferProgressTrackerProps) {
  const activeStep =
    selectedStep ?? steps.find(step => step.status === 'current')?.key ?? steps[steps.length - 1]?.key
  const completedCount = steps.filter(step => step.status === 'complete').length
  const progressPercentage = Math.min(100, Math.max(0, (completedCount / steps.length) * 100))

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-end">
          <span className="text-xs font-medium text-primary">
            {completedCount}/{steps.length}ステップ完了
          </span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="hidden gap-4 md:flex">
        {steps.map((step, index) => {
          const circleClass = stepStatusStyles[step.status]
          const isSelected = step.key === activeStep
          const circleContent =
            step.status === 'complete' ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>
          return (
            <div key={step.key} className="flex flex-1 flex-col items-center text-center">
              <button
                type="button"
                onClick={() => onStepSelect?.(step.key)}
                className="group flex w-full flex-1 flex-col items-center gap-2 focus:outline-none"
                aria-pressed={isSelected}
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full bg-background text-sm font-medium transition-all',
                    circleClass,
                    isSelected && 'ring-2 ring-offset-2 ring-primary',
                  )}
                >
                  {circleContent}
                </div>
                <div className="space-y-1">
                  <span className="block text-sm font-medium text-foreground">{step.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {step.subLabel
                      ? step.subLabel
                      : step.status === 'complete'
                        ? '完了'
                        : step.status === 'current'
                          ? '進行中'
                          : '未着手'}
                  </span>
                </div>
              </button>
            </div>
          )
        })}
      </div>

      <ol className="flex flex-col gap-4 md:hidden">
        {steps.map((step, index) => {
          const circleClass = stepStatusStyles[step.status]
          const isSelected = step.key === activeStep
          return (
            <li key={step.key}>
              <button
                type="button"
                onClick={() => onStepSelect?.(step.key)}
                className="flex w-full items-start gap-3 rounded-xl border border-transparent bg-background p-3 text-left transition hover:border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-pressed={isSelected}
              >
                <div
                  className={cn(
                    'mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-background text-sm font-medium transition-all',
                    circleClass,
                    isSelected && 'ring-2 ring-offset-2 ring-primary',
                  )}
                >
                  {step.status === 'complete' ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{step.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {step.subLabel
                      ? step.subLabel
                      : step.status === 'complete'
                        ? '完了'
                        : step.status === 'current'
                          ? '進行中'
                          : '未着手'}
                  </span>
                </div>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
