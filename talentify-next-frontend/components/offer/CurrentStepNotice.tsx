'use client'

import { ArrowLeft } from 'lucide-react'
import {
  OFFER_STEP_LABELS,
  type OfferStepKey,
} from '@/utils/offerProgress'

type CurrentStepNoticeProps = {
  currentStep: OfferStepKey
  selectedStep: OfferStepKey
  onReturn: () => void
}

export default function CurrentStepNotice({
  currentStep,
  selectedStep,
  onReturn,
}: CurrentStepNoticeProps) {
  if (currentStep === selectedStep) return null

  return (
    <div className="mt-4 flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-amber-800">
          別のステップを表示中です
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-amber-700 sm:text-sm">
          現在の対応ステップは「{OFFER_STEP_LABELS[currentStep]}」です。
        </p>
      </div>

      <button
        type="button"
        onClick={onReturn}
        className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        現在のステップへ戻る
      </button>
    </div>
  )
}
