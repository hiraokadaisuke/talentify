'use client'

import { useMemo, type ReactNode } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { OfferProgressStatus, OfferStepKey } from '@/utils/offerProgress'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { resolveMainActionPhase } from '@/lib/offers/mainActionPhase'

type StepDetailCardProps = {
  activeStep: OfferStepKey
  activeStatus: OfferProgressStatus
  offer: {
    id: string
    status: string
    date: string | null
    updatedAt: string
    submittedAt: string | null
    paid: boolean
    paidAt: string | null
    invoiceStatus: 'not_submitted' | 'submitted' | 'paid'
    invoiceStatusLabel: string
    paymentStatusLabel: string
    reviewCompleted: boolean
  }
  invoiceId: string | null
  onDeclineOffer?: () => void
  actionLoading?: 'decline' | null
}

type StepDetail = {
  title: string
  description: string
  badge?: ReactNode
  meta?: { label: string; value: string }[]
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
}

const primaryActionClass = 'h-9 bg-blue-700 px-4 text-white hover:bg-blue-800 focus-visible:ring-blue-300'
const secondaryActionClass = 'h-9 border-slate-300 bg-white px-4 text-slate-700 hover:bg-slate-100'

const statusDisplay = (status: string) => {
  switch (status) {
    case 'pending':
      return { text: '相談中', badge: <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">相談中</Badge> }
    case 'accepted':
      return { text: '承認済み', badge: <Badge variant="success">承認済み</Badge> }
    case 'confirmed':
      return { text: '締結済み', badge: <Badge variant="success">締結済み</Badge> }
    case 'completed':
      return { text: '完了', badge: <Badge variant="success">完了</Badge> }
    case 'rejected':
      return { text: '辞退済み', badge: <Badge variant="secondary">辞退済み</Badge> }
    case 'canceled':
      return { text: 'キャンセル済み', badge: <Badge variant="destructive">キャンセル済み</Badge> }
    case 'no_show':
      return { text: '来店なし', badge: <Badge variant="destructive">来店なし</Badge> }
    default:
      return { text: '未承諾', badge: <Badge variant="secondary">未承諾</Badge> }
  }
}

export default function StepDetailCard({
  activeStep,
  activeStatus,
  offer,
  invoiceId,
  onDeclineOffer,
  actionLoading,
}: StepDetailCardProps) {
  const formattedVisitDate = useMemo(() => offer.date ? format(new Date(offer.date), 'yyyy/MM/dd (EEE) HH:mm', { locale: ja }) : '未設定', [offer.date])

  const mainActionDetail = useMemo<StepDetail>(() => {
    const phase = resolveMainActionPhase({
      role: 'talent',
      status: offer.status,
      invoiceStatus: offer.invoiceStatus,
      paid: offer.paid,
      reviewCompleted: offer.reviewCompleted,
    })

    switch (phase) {
      case 'invoice_waiting':
        return {
          title: '見積書を作成してください',
          description: '事前に相談した出演料・交通費などを見積書にまとめて提出してください。',
          badge: <Badge variant="outline">見積作成</Badge>,
          meta: [{ label: '見積ステータス', value: offer.invoiceStatusLabel }],
          primaryAction: <Button className={primaryActionClass} asChild><Link href={`/talent/invoices/new?offerId=${offer.id}`}>見積書を作成する</Link></Button>,
        }
      case 'payment_waiting':
        return offer.status === 'confirmed'
          ? {
              title: '取引が締結されました',
              description: 'ホールが見積内容を承認し、取引締結書兼請求書が発行されました。',
              badge: <Badge variant="success">締結済み</Badge>,
              meta: [{ label: '支払い状態', value: offer.paymentStatusLabel }],
              primaryAction: invoiceId ? <Button className={primaryActionClass} asChild><Link href={`/talent/invoices/${invoiceId}`}>締結書兼請求書を見る</Link></Button> : undefined,
            }
          : {
              title: '見積書を提出しました',
              description: 'ホール側で見積内容を確認しています。必要に応じてメッセージで調整してください。',
              badge: <Badge variant="outline">ホール確認待ち</Badge>,
              meta: [{ label: '見積ステータス', value: offer.invoiceStatusLabel }],
              primaryAction: invoiceId ? <Button className={primaryActionClass} asChild><Link href={`/talent/invoices/${invoiceId}`}>提出した見積書を見る</Link></Button> : undefined,
            }
      case 'review_available':
        return {
          title: 'レビューが届いています',
          description: '店舗からのレビューを確認しましょう。',
          badge: <Badge variant="success">レビューあり</Badge>,
          meta: [{ label: 'レビュー状態', value: '店舗レビューあり' }],
          primaryAction: <Button className={primaryActionClass} asChild><Link href="/talent/reviews">レビューを確認する</Link></Button>,
        }
      case 'completed':
        return {
          title: '取引が完了しました',
          description: 'この案件はすべてのステップが完了しています。',
          badge: <Badge variant="success">全完了</Badge>,
          meta: [{ label: 'レビュー状態', value: '確認済み' }],
          primaryAction: <Button className={primaryActionClass} asChild><Link href="/talent/reviews">レビューを確認する</Link></Button>,
        }
      case 'payment_completed_review_waiting':
        return {
          title: '支払いが完了しました',
          description: '支払いは完了しています。店舗レビューの投稿をお待ちください。',
          badge: <Badge>レビュー待ち</Badge>,
          meta: [{ label: '支払い状態', value: offer.paymentStatusLabel }],
        }
      default:
        return {
          title: '請求書の準備がこれからです',
          description: 'まだ請求書が作成されていない状態です。進行ステップバーで状況を確認してください。',
          badge: <Badge variant="outline">準備中</Badge>,
        }
    }
  }, [offer.status, offer.invoiceStatus, offer.paid, offer.reviewCompleted, offer.invoiceStatusLabel, offer.paymentStatusLabel, offer.id, invoiceId])

  const detail = useMemo<StepDetail>(() => {
    if (['invoice', 'payment', 'review'].includes(activeStep)) {
      return mainActionDetail
    }

    if (activeStep === 'offer_submitted') {
      return {
        title: 'オファー・条件相談',
        description: '店舗からオファーが届いています。メッセージや必要に応じて電話で条件を相談してください。',
        badge: activeStatus === 'complete' ? <Badge variant="success">完了</Badge> : undefined,
        meta: [
          { label: '来店予定', value: formattedVisitDate },
        ],
      }
    }

    if (activeStep === 'approval') {
      const status = statusDisplay(offer.status)
      const estimateSubmitted = offer.invoiceStatus === 'submitted' || offer.invoiceStatus === 'paid'
      return {
        title: estimateSubmitted ? '見積書を提出しました' : '見積書を作成',
        description: estimateSubmitted
          ? 'ホール側の確認待ちです。必要に応じてメッセージで条件を調整してください。'
          : '条件がまとまったら、出演料・交通費・追加費用などを見積書にまとめて提出してください。',
        badge: estimateSubmitted ? <Badge variant="outline">ホール確認待ち</Badge> : status.badge,
        meta: [
          { label: '案件ステータス', value: status.text },
          { label: '見積ステータス', value: offer.invoiceStatusLabel },
        ],
        primaryAction: estimateSubmitted && invoiceId ? (
          <Button className={primaryActionClass} asChild><Link href={`/talent/invoices/${invoiceId}`}>提出した見積書を見る</Link></Button>
        ) : offer.status === 'pending' ? (
          <Button className={primaryActionClass} asChild><Link href={invoiceId ? `/talent/invoices/${invoiceId}` : `/talent/invoices/new?offerId=${offer.id}`}>{invoiceId ? '見積書を編集する' : '見積書を作成する'}</Link></Button>
        ) : undefined,
        secondaryAction: offer.status === 'pending' && onDeclineOffer ? (
          <Button variant="outline" className={secondaryActionClass} onClick={onDeclineOffer} disabled={actionLoading !== null}>{actionLoading === 'decline' ? '処理中...' : '今回は対応できない'}</Button>
        ) : undefined,
      }
    }

    if (offer.status === 'no_show') {
      return {
        title: '来店なし',
        description: '店舗から来店なしとして記録されています。支払い・レビューには進みません。',
        badge: <Badge variant="destructive">来店なし</Badge>,
        meta: [{ label: '来店日時', value: formattedVisitDate }],
      }
    }

    return {
      title: '来店実施',
      description: '来店日時と当日の連絡事項を確認してください。',
      badge: activeStatus === 'complete' ? <Badge variant="success">完了</Badge> : undefined,
      meta: [
        { label: '来店日時', value: formattedVisitDate },
      ],
    }
  }, [activeStep, activeStatus, mainActionDetail, formattedVisitDate, offer.status, offer.invoiceStatus, offer.invoiceStatusLabel, offer.id, invoiceId, onDeclineOffer, actionLoading])

  return (
    <Card className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-1.5 border-b border-slate-100 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle className="text-base font-semibold text-slate-900 sm:text-lg">{detail.title}</CardTitle>
          {detail.badge}
        </div>
        <p className="break-words text-sm leading-relaxed text-muted-foreground">{detail.description}</p>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-5">
        {detail.meta && detail.meta.length > 0 && (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {detail.meta.map(item => (
              <div key={item.label} className="space-y-0.5">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                <dd className="text-sm font-semibold text-slate-900 sm:text-base">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:justify-end">
          {detail.secondaryAction && <div className="flex w-full sm:inline-flex sm:w-auto">{detail.secondaryAction}</div>}
          {detail.primaryAction && <div className="flex w-full sm:inline-flex sm:w-auto">{detail.primaryAction}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
