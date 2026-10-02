'use client'

import OfferProgressTracker from '@/components/offer/OfferProgressTracker'
import CurrentStepNotice from '@/components/offer/CurrentStepNotice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { OfferProgressStep, OfferStepKey } from '@/utils/offerProgress'

type ProgressCardProps = {
  steps: OfferProgressStep[]
  activeStep: OfferStepKey
  currentStep: OfferStepKey
  onStepChange: (step: OfferStepKey) => void
}

export default function ProgressCard({ steps, activeStep, currentStep, onStepChange }: ProgressCardProps) {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]">
      <CardHeader className="space-y-1 px-4 pt-4 sm:px-5 sm:pt-5">
        <CardTitle className="text-base font-black text-slate-950 sm:text-lg">進捗状況</CardTitle>
        <p className="hidden text-xs leading-relaxed text-muted-foreground sm:block sm:text-sm">オファーの進行状況と各ステップの対応内容を確認できます。</p>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 sm:px-5 sm:pb-5 sm:pt-1">
        <OfferProgressTracker steps={steps} selectedStep={activeStep} onStepSelect={onStepChange} />
        <CurrentStepNotice
          currentStep={currentStep}
          selectedStep={activeStep}
          onReturn={() => onStepChange(currentStep)}
        />
      </CardContent>
    </Card>
  )
}
