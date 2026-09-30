'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { OfferProgressStep, OfferProgressStatus, OfferStepKey } from '@/utils/offerProgress'
import ProgressCard from './ProgressCard'
import StepDetailCard from './StepDetailCard'
import SubmittedOfferContentCard from './SubmittedOfferContentCard'

type TalentOfferProgressPanelProps = {
  steps: OfferProgressStep[]
  initialActiveStep: OfferStepKey
  offer: {
    id: string
    status: string
    date: string | null
    timeRange: string | null
    reward: number | null
    updatedAt: string
    submittedAt: string | null
    paid: boolean
    paidAt: string | null
    invoiceStatus: 'not_submitted' | 'submitted' | 'paid'
    invoiceStatusLabel: string
    paymentStatusLabel: string
    reviewCompleted: boolean
    message: string | null
  }
  invoiceId: string | null
  paymentLink?: string
  onAcceptOffer?: () => void
  onDeclineOffer?: () => void
  actionLoading?: 'accept' | 'decline' | null
}

export default function TalentOfferProgressPanel({
  steps,
  initialActiveStep,
  offer,
  invoiceId,
  paymentLink,
  onAcceptOffer,
  onDeclineOffer,
  actionLoading,
}: TalentOfferProgressPanelProps) {
  const [activeStep, setActiveStep] = useState<OfferStepKey>(initialActiveStep)

  useEffect(() => {
    setActiveStep(initialActiveStep)
  }, [initialActiveStep])

  const formattedSubmittedAt = useMemo(() => {
    return offer.submittedAt
      ? `提出日時: ${format(new Date(offer.submittedAt), 'yyyy/MM/dd HH:mm', { locale: ja })}`
      : '提出日時: 未登録'
  }, [offer.submittedAt])

  const formattedVisitDate = useMemo(() => {
    return offer.date ? format(new Date(offer.date), 'yyyy/MM/dd (EEE) HH:mm', { locale: ja }) : '未設定'
  }, [offer.date])

  const paymentCompletedLabel = useMemo(() => {
    return offer.paidAt ? format(new Date(offer.paidAt), 'yyyy/MM/dd', { locale: ja }) : undefined
  }, [offer.paidAt])

  const progressSteps = useMemo(() => {
    return steps.map(step => {
      switch (step.key) {
        case 'offer_submitted':
          return { ...step, subLabel: formattedSubmittedAt }
        case 'approval':
          return { ...step }
        case 'visit':
          return { ...step, subLabel: `来店予定: ${formattedVisitDate}` }
        case 'invoice':
          return { ...step, subLabel: `請求状況: ${offer.invoiceStatusLabel}` }
        case 'payment':
          return {
            ...step,
            subLabel:
              paymentCompletedLabel != null
                ? `支払い日: ${paymentCompletedLabel}`
                : `支払い状況: ${offer.paid ? '完了' : '未完了'}`,
          }
        case 'review':
          return { ...step, subLabel: `レビュー: ${offer.reviewCompleted ? 'レビュー済み' : 'レビュー未実施'}` }
        default:
          return step
      }
    })
  }, [
    formattedSubmittedAt,
    formattedVisitDate,
    offer.invoiceStatusLabel,
    offer.paid,
    offer.reviewCompleted,
    paymentCompletedLabel,
    steps,
  ])

  const activeStatus: OfferProgressStatus = useMemo(() => {
    return progressSteps.find(step => step.key === activeStep)?.status ?? 'upcoming'
  }, [progressSteps, activeStep])

  return (
    <div className="space-y-4">
      <ProgressCard steps={progressSteps} activeStep={activeStep} onStepChange={setActiveStep} />
      <SubmittedOfferContentCard
        submittedOffer={{
          preferredDate: offer.date,
          preferredTimeRange: offer.timeRange,
          reward: offer.reward,
          transportationFee: null,
          message: offer.message,
        }}
      />
      <StepDetailCard
        activeStep={activeStep}
        activeStatus={activeStatus}
        offer={offer}
        invoiceId={invoiceId}
        paymentLink={paymentLink}
        onAcceptOffer={onAcceptOffer}
        onDeclineOffer={onDeclineOffer}
        actionLoading={actionLoading}
      />
    </div>
  )
}
