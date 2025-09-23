'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import OfferProgressTracker from '@/components/offer/OfferProgressTracker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { OfferProgressStep, OfferProgressStatus, OfferStepKey } from '@/utils/offerProgress'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface StoreOfferProgressPanelProps {
  steps: OfferProgressStep[]
  currentStep: OfferStepKey
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
  invoice?: {
    id: string
    invoiceUrl: string | null
    amount: number | null
    status: string
  } | null
  paymentLink?: string
}

type StepDetail = {
  title: string
  description: string
  badge?: ReactNode
  meta?: { label: string; value: string }[]
  actions?: ReactNode[]
  note?: ReactNode
}

const invoiceStatusText: Record<'not_submitted' | 'submitted' | 'paid', string> = {
  not_submitted: '未提出',
  submitted: '提出済み',
  paid: '支払済み',
}

export default function StoreOfferProgressPanel({
  steps,
  currentStep,
  offer,
  invoice,
  paymentLink,
}: StoreOfferProgressPanelProps) {
  const [activeStep, setActiveStep] = useState<OfferStepKey>(currentStep)

  useEffect(() => {
    setActiveStep(currentStep)
  }, [currentStep])

  const formattedUpdatedAt = useMemo(() => {
    return format(new Date(offer.updatedAt), 'yyyy/MM/dd HH:mm', { locale: ja })
  }, [offer.updatedAt])

  const formattedSubmittedAt = useMemo(() => {
    return offer.submittedAt ? format(new Date(offer.submittedAt), 'yyyy/MM/dd HH:mm', { locale: ja }) : '未提出'
  }, [offer.submittedAt])

  const formattedVisitDate = useMemo(() => {
    return offer.date ? format(new Date(offer.date), 'yyyy/MM/dd (EEE) HH:mm', { locale: ja }) : '未設定'
  }, [offer.date])

  const paymentCompletedLabel = useMemo(() => {
    return offer.paidAt ? format(new Date(offer.paidAt), 'yyyy/MM/dd', { locale: ja }) : undefined
  }, [offer.paidAt])

  const submittedDateLabel = useMemo(() => {
    return offer.submittedAt ? format(new Date(offer.submittedAt), 'yyyy/MM/dd', { locale: ja }) : null
  }, [offer.submittedAt])

  const approvalDeadlineLabel = useMemo(() => {
    return offer.date ? format(new Date(offer.date), 'yyyy/MM/dd', { locale: ja }) : null
  }, [offer.date])

  const statusBadge = useMemo(() => {
    switch (offer.status) {
      case 'confirmed':
      case 'accepted':
        return <Badge>承認済み</Badge>
      case 'rejected':
        return <Badge variant="secondary">辞退済み</Badge>
      case 'canceled':
        return <Badge variant="destructive">キャンセル済み</Badge>
      default:
        return <Badge variant="outline">承認待ち</Badge>
    }
  }, [offer.status])

  const progressSteps = useMemo(() => {
    return steps.map(step => {
      switch (step.key) {
        case 'offer_submitted':
          return { ...step, subLabel: submittedDateLabel ?? '未登録' }
        case 'approval':
          return {
            ...step,
            subLabel: approvalDeadlineLabel ? `期限: ${approvalDeadlineLabel}` : '期限: 未設定',
          }
        case 'visit':
          return { ...step, subLabel: formattedVisitDate }
        case 'invoice':
          return { ...step, subLabel: invoiceStatusText[offer.invoiceStatus] }
        case 'payment':
          return {
            ...step,
            subLabel: paymentCompletedLabel ?? (offer.paid ? '支払済み' : '未払い'),
          }
        case 'review':
          return { ...step, subLabel: step.status === 'complete' ? '完了' : '未実施' }
        default:
          return step
      }
    })
  }, [steps, submittedDateLabel, approvalDeadlineLabel, formattedVisitDate, offer.invoiceStatus, paymentCompletedLabel, offer.paid])

  const activeStepStatus: OfferProgressStatus = useMemo(() => {
    return progressSteps.find(step => step.key === activeStep)?.status ?? 'upcoming'
  }, [progressSteps, activeStep])

  const buildStepDetail = (step: OfferStepKey, status: OfferProgressStatus): StepDetail => {
    switch (step) {
      case 'offer_submitted':
        return {
          title: 'オファー提出',
          description: '店舗からタレントへオファーを送信しました。返信内容はメッセージで確認できます。',
          meta: [
            { label: '提出日時', value: formattedSubmittedAt },
            { label: '来店予定', value: formattedVisitDate },
          ],
          actions: [
            <Button key="message" variant="outline" size="sm" asChild>
              <a href="#chat">メッセージを送る</a>
            </Button>,
          ],
          badge: status === 'complete' ? <Badge variant="success">完了</Badge> : undefined,
        }
      case 'approval': {
        let description = ''
        switch (offer.status) {
          case 'pending':
            description = 'タレントからの返答をお待ちください。必要に応じてメッセージで詳細を共有しましょう。'
            break
          case 'accepted':
            description = 'タレントがオファーを承認しました。来店日時の最終確認を進めてください。'
            break
          case 'confirmed':
            description = '承認が完了し、来店の段取りに進めます。訪問予定の共有を忘れずに行いましょう。'
            break
          case 'rejected':
            description = 'タレントがオファーを辞退しました。別の候補者へのオファー送信をご検討ください。'
            break
          case 'canceled':
            description = 'オファーはキャンセルされました。必要であれば新しいオファーを作成してください。'
            break
          default:
            description = '承認手続きが完了しました。次のステップに進みましょう。'
            break
        }
        return {
          title: '承認',
          description,
          badge: statusBadge,
          meta: [
            { label: '最終更新', value: formattedUpdatedAt },
          ],
          actions: [
            <Button key="message" variant="outline" size="sm" asChild>
              <a href="#chat">メッセージを送る</a>
            </Button>,
          ],
        }
      }
      case 'visit': {
        let description = ''
        if (offer.status === 'completed') {
          description = '来店が完了しました。続けて請求内容を確認してください。'
        } else if (offer.status === 'confirmed') {
          description = '来店予定が確定しています。必要な持ち物や当日の流れをメッセージで共有しましょう。'
        } else if (offer.status === 'accepted') {
          description = 'タレントの承認を受けました。来店日時を確定し、詳細を連絡してください。'
        } else if (offer.status === 'canceled') {
          description = 'オファーがキャンセルされたため、来店は行われません。'
        } else if (offer.status === 'rejected') {
          description = '辞退済みのため来店は行われません。'
        } else {
          description = '来店日時の調整を進めてください。'
        }
        return {
          title: '来店実施',
          description,
          badge: status === 'complete' ? <Badge variant="success">完了</Badge> : undefined,
          meta: [
            { label: '来店日時', value: formattedVisitDate },
            { label: '最終更新', value: formattedUpdatedAt },
          ],
          actions: [
            <Button key="message" variant="outline" size="sm" asChild>
              <a href="#chat">メッセージを送る</a>
            </Button>,
          ],
        }
      }
      case 'invoice': {
        let description = ''
        if (offer.invoiceStatus === 'not_submitted') {
          description = 'タレントからの請求書提出をお待ちください。提出されると通知されます。'
        } else if (offer.invoiceStatus === 'submitted') {
          description = '請求書が提出されました。内容を確認し、支払い手続きへ進みましょう。'
        } else {
          description = '請求の確認が完了しました。支払いステップへ進んでください。'
        }
        const actions: ReactNode[] = [
          <Button key="message" variant="outline" size="sm" asChild>
            <a href="#chat">メッセージを送る</a>
          </Button>,
        ]
        if (invoice) {
          actions.push(
            <Button key="invoice" variant="outline" size="sm" asChild>
              <Link href={`/store/invoices/${invoice.id}`}>請求書を見る</Link>
            </Button>,
          )
        }
        return {
          title: '請求',
          description,
          badge: status === 'complete' ? <Badge variant="success">完了</Badge> : undefined,
          meta: [
            { label: '請求ステータス', value: invoiceStatusText[offer.invoiceStatus] },
            ...(invoice?.amount != null
              ? [{ label: '請求額', value: `¥${invoice.amount.toLocaleString('ja-JP')}` }]
              : []),
          ],
          actions,
        }
      }
      case 'payment': {
        const description = offer.paid
          ? '支払いが完了しました。必要に応じてレビューの準備を進めてください。'
          : '請求内容を確認し、支払いを完了してください。支払いが完了するとレビューに進めます。'
        const actions: ReactNode[] = [
          <Button key="message" variant="outline" size="sm" asChild>
            <a href="#chat">メッセージを送る</a>
          </Button>,
        ]
        if (paymentLink) {
          actions.push(
            <Button key="payment" size="sm" asChild>
              <Link href={paymentLink}>支払い状況</Link>
            </Button>,
          )
        }
        return {
          title: '支払い',
          description,
          badge: offer.paid ? <Badge variant="success">完了</Badge> : undefined,
          meta: [
            { label: '支払い状況', value: offer.paid ? '完了' : '未完了' },
            ...(paymentCompletedLabel
              ? [{ label: '支払い日', value: paymentCompletedLabel }]
              : []),
          ],
          actions,
        }
      }
      case 'review':
      default:
        return {
          title: 'レビュー',
          description: '支払い完了後にタレントへのレビューを記入できます。来店内容を振り返って評価を準備しましょう。',
          badge: status === 'complete' ? <Badge variant="success">完了</Badge> : undefined,
          actions: [
            <Button key="message" variant="outline" size="sm" asChild>
              <a href="#chat">メッセージを送る</a>
            </Button>,
          ],
        }
    }
  }

  const detail = buildStepDetail(activeStep, activeStepStatus)

  return (
    <div className="space-y-8">
      <div className="mx-auto w-full max-w-3xl">
        <OfferProgressTracker
          steps={progressSteps}
          selectedStep={activeStep}
          onStepSelect={setActiveStep}
        />
      </div>
      <div className="rounded-2xl border bg-card p-6 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">{detail.title}</h3>
          {detail.badge}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{detail.description}</p>
        {detail.meta && detail.meta.length > 0 && (
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {detail.meta.map(item => (
              <div key={item.label} className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                <dd className="text-sm font-semibold text-foreground">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {detail.actions && detail.actions.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            {detail.actions.map((action, index) => (
              <div key={index} className="inline-flex">
                {action}
              </div>
            ))}
          </div>
        )}
        {detail.note && <div className="mt-4 text-sm text-muted-foreground">{detail.note}</div>}
      </div>
    </div>
  )
}
