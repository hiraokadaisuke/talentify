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
    <Card className="rounded-2xl border border-slate-200 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-semibold text-slate-900">進捗状況</CardTitle>
        <p className="text-sm text-muted-foreground">オファーの進行状況と各ステップの対応内容を確認できます。</p>
      </CardHeader>
      <CardContent className="pt-2">
        <OfferProgressTracker steps={steps} selectedStep={activeStep} onStepSelect={onStepChange} />
      </CardContent>
    </Card>
  )
}

