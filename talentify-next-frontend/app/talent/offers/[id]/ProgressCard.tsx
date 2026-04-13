'use client'

import OfferProgressTracker from '@/components/offer/OfferProgressTracker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { OfferProgressStep, OfferStepKey } from '@/utils/offerProgress'

type ProgressCardProps = {
  steps: OfferProgressStep[]
  activeStep: OfferStepKey
  onStepChange: (step: OfferStepKey) => void
}

export default function ProgressCard({ steps, activeStep, onStepChange }: ProgressCardProps) {
  return (
    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="space-y-1 px-4 pt-4 sm:px-5 sm:pt-5">
        <CardTitle className="text-base font-semibold text-slate-900 sm:text-lg">進捗状況</CardTitle>
        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">オファーの進行状況と各ステップの対応内容を確認できます。</p>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-1 sm:px-5 sm:pb-5">
        <OfferProgressTracker steps={steps} selectedStep={activeStep} onStepSelect={onStepChange} />
      </CardContent>
    </Card>
  )
}
