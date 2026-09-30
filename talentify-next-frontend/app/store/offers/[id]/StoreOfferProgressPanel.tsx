'use client'

import { useEffect, useMemo, useState } from 'react'
import type { OfferProgressStep, OfferProgressStatus, OfferStepKey } from '@/utils/offerProgress'
import type { OfferInvoiceProgressStatus } from '@/lib/invoices/status'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import ProgressCard from './ProgressCard'
import StepDetailCard from './StepDetailCard'
import SubmittedOfferContentCard from './SubmittedOfferContentCard'

interface StoreOfferProgressPanelProps {
  steps: OfferProgressStep[]
  initialActiveStep: OfferStepKey
  offer: {
    id: string
    status: string
    date: string | null
    updatedAt: string
    submittedAt: string | null
    paid: boolean
    paidAt: string | null
    invoiceStatus: OfferInvoiceProgressStatus
    invoiceStatusLabel: string
    paymentStatusLabel: string
    storeName: string
    reward: number | null
    talentId: string | null
    reviewCompleted: boolean
    timeRange: string | null
    originalMessage: string | null
  }
  invoice?: {
    id: string
    invoiceUrl: string | null
    amount: number | null
    status: string
    paymentStatus: string | null
  } | null
  cancelation: {
    initialStatus: string
    initialCanceledAt: string | null
  }
}

export default function StoreOfferProgressPanel({
  steps,
  initialActiveStep,
  offer,
  invoice,
  cancelation,
}: StoreOfferProgressPanelProps) {
  const [activeStep, setActiveStep] = useState<OfferStepKey>(initialActiveStep)

  useEffect(() => setActiveStep(initialActiveStep), [initialActiveStep])

  const formattedSubmittedAt = useMemo(
    () => offer.submittedAt ? format(new Date(offer.submittedAt), 'yyyy/MM/dd HH:mm', { locale: ja }) : '未登録',
    [offer.submittedAt],
  )
  const formattedVisitDate = useMemo(
    () => offer.date ? format(new Date(offer.date), 'yyyy/MM/dd (EEE) HH:mm', { locale: ja }) : '未設定',
    [offer.date],
  )
  const paymentCompletedLabel = useMemo(
    () => offer.paidAt ? format(new Date(offer.paidAt), 'yyyy/MM/dd', { locale: ja }) : undefined,
    [offer.paidAt],
  )

  const progressSteps = useMemo(
    () => steps.map(step => {
      switch (step.key) {
        case 'offer_consultation':
          return { ...step, subLabel: `送信: ${formattedSubmittedAt}` }
        case 'estimate':
          return { ...step, subLabel: `見積: ${offer.invoiceStatusLabel}` }
        case 'contract':
          return { ...step, subLabel: offer.invoiceStatus === 'approved' || offer.invoiceStatus === 'paid' ? '締結済み' : '見積承認後に締結' }
        case 'visit':
          return { ...step, subLabel: `来店予定: ${formattedVisitDate}` }
        case 'payment':
          return { ...step, subLabel: paymentCompletedLabel ? `支払い日: ${paymentCompletedLabel}` : `支払い: ${offer.paymentStatusLabel}` }
        case 'review':
          return { ...step, subLabel: `レビュー: ${offer.reviewCompleted ? '完了' : '未実施'}` }
        default:
          return step
      }
    }),
    [steps, formattedSubmittedAt, formattedVisitDate, offer.invoiceStatus, offer.invoiceStatusLabel, offer.paymentStatusLabel, offer.reviewCompleted, paymentCompletedLabel],
  )

  const activeStatus: OfferProgressStatus =
    progressSteps.find(step => step.key === activeStep)?.status ?? 'upcoming'

  return (
    <div className="space-y-4">
      <ProgressCard steps={progressSteps} activeStep={activeStep} onStepChange={setActiveStep} />
      <SubmittedOfferContentCard
        submittedOffer={{
          preferredDate: offer.date,
          preferredTimeRange: offer.timeRange,
          reward: offer.reward,
          message: offer.originalMessage,
        }}
      />
      <StepDetailCard
        activeStep={activeStep}
        activeStatus={activeStatus}
        offer={offer}
        invoice={invoice}
        cancelation={cancelation}
      />
    </div>
  )
}
