'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { OfferProgressStep, OfferProgressStatus, OfferStepKey } from '@/utils/offerProgress'
import ProgressCard from './ProgressCard'
import StepDetailCard from './StepDetailCard'
import MessageCard from './MessageCard'

type TalentOfferProgressPanelProps = {
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
    invoiceStatus: 'not_submitted' | 'submitted' | 'paid'
  }
  invoiceId: string | null
  paymentLink?: string
  message: {
    offerId: string
    currentUserId: string
    storeName: string
    talentName: string
  }
}

export default function TalentOfferProgressPanel({
  steps,
  initialActiveStep,
  offer,
  invoiceId,
  paymentLink,
  message,
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
          return { ...step, subLabel: `請求状況: ${invoiceStatusText[offer.invoiceStatus]}` }
        case 'payment':
          return {
            ...step,
            subLabel:
              paymentCompletedLabel != null
                ? `支払い日: ${paymentCompletedLabel}`
                : `支払い状況: ${offer.paid ? '完了' : '未完了'}`,
          }
        case 'review':
          return { ...step, subLabel: `レビュー: ${step.status === 'complete' ? '完了' : '未実施'}` }
        default:
          return step
      }
    })
  }, [formattedSubmittedAt, formattedVisitDate, offer.invoiceStatus, offer.paid, paymentCompletedLabel, steps])

  const activeStatus: OfferProgressStatus = useMemo(() => {
    return progressSteps.find(step => step.key === activeStep)?.status ?? 'upcoming'
  }, [progressSteps, activeStep])

  return (
    <div className="space-y-6">
      <ProgressCard steps={progressSteps} activeStep={activeStep} onStepChange={setActiveStep} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StepDetailCard
            activeStep={activeStep}
            activeStatus={activeStatus}
            offer={offer}
            invoiceId={invoiceId}
            paymentLink={paymentLink}
          />
        </div>
        <div className="lg:col-span-1">
          <MessageCard
            offerId={message.offerId}
            currentUserId={message.currentUserId}
            storeName={message.storeName}
            talentName={message.talentName}
          />
        </div>
      </div>
    </div>
  )
}

const invoiceStatusText: Record<'not_submitted' | 'submitted' | 'paid', string> = {
  not_submitted: '未提出',
  submitted: '提出済み',
  paid: '支払済み',
}

