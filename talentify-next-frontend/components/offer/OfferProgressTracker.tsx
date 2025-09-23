'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OfferProgressStep } from '@/utils/offerProgress'

interface OfferProgressTrackerProps {
  steps: OfferProgressStep[]
}

const stepStatusStyles: Record<OfferProgressStep['status'], string> = {
  complete: 'bg-primary text-primary-foreground border-primary',
  current: 'border-2 border-primary text-primary',
  upcoming: 'border border-border text-muted-foreground',
}

export default function OfferProgressTracker({ steps }: OfferProgressTrackerProps) {
  return (
    <div className="space-y-6">
      <div className="hidden md:flex md:flex-col md:gap-4">
        <div className="flex items-start">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1
            const circleClass = stepStatusStyles[step.status]
            const lineActive = step.status === 'complete'
            return (
              <div key={step.key} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full bg-background text-sm font-medium',
                      circleClass,
                    )}
                  >
                    {step.status === 'complete' ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground">{step.title}</span>
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      'mx-4 h-[2px] flex-1 rounded-full bg-border transition-colors',
                      lineActive && 'bg-primary',
                    )}
                    aria-hidden
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <ol className="flex flex-col gap-4 md:hidden">
        {steps.map((step, index) => {
          const circleClass = stepStatusStyles[step.status]
          return (
            <li key={step.key} className="flex items-start gap-3">
              <div
                className={cn(
                  'mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-background text-sm font-medium',
                  circleClass,
                )}
              >
                {step.status === 'complete' ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{step.title}</span>
                <span className="text-xs text-muted-foreground">
                  {step.status === 'complete'
                    ? '完了'
                    : step.status === 'current'
                      ? '進行中'
                      : '未完了'}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
