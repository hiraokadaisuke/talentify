'use client'

import { useCallback, useMemo, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { OfferProgressStatus, OfferStepKey } from '@/utils/offerProgress'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import CancelOfferSection from './CancelOfferSection'
import ReviewModal from '@/components/modals/ReviewModal'
import { resolveMainActionPhase } from '@/lib/offers/mainActionPhase'

type StepDetailCardProps = {
  activeStep: OfferStepKey
  activeStatus: OfferProgressStatus
  offer: {
    id: string
    status: string
    storeName: string
    submittedAt: string | null
    updatedAt: string
    respondDeadline: string | null
    date: string | null
    paid: boolean
    paidAt: string | null
    invoiceStatus: 'not_submitted' | 'submitted' | 'paid'
    invoiceStatusLabel: string
    paymentStatusLabel: string
    reward: number | null
    talentId: string | null
    reviewCompleted: boolean
  }
  invoice?: {
    id: string
    invoiceUrl: string | null
    amount: number | null
    status: string
    paymentStatus: string | null
  } | null
  paymentLink?: string
  cancelation?: {
    initialStatus: string
    initialCanceledAt: string | null
  }
}

type StepDetail = {
  title: string
  description: string
  badge?: ReactNode
  meta?: { label: string; value: string }[]
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
  footer?: ReactNode
}

const statusBadge = (status: string) => {
  switch (status) {
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
}

export default function StepDetailCard({ activeStep, activeStatus, offer, invoice, paymentLink, cancelation }: StepDetailCardProps) {
  const router = useRouter()

  const handleReviewSubmitted = useCallback(() => {
    router.refresh()
  }, [router])

  const formattedSubmittedAt = useMemo(() => {
    return offer.submittedAt ? format(new Date(offer.submittedAt), 'yyyy/MM/dd HH:mm', { locale: ja }) : '未提出'
  }, [offer.submittedAt])
  const formattedUpdatedAt = useMemo(() => format(new Date(offer.updatedAt), 'yyyy/MM/dd HH:mm', { locale: ja }), [offer.updatedAt])
  const formattedVisitDate = useMemo(() => offer.date ? format(new Date(offer.date), 'yyyy/MM/dd (EEE) HH:mm', { locale: ja }) : '未設定', [offer.date])
  const formattedRespondDeadline = useMemo(() => offer.respondDeadline ? format(new Date(offer.respondDeadline), 'yyyy/MM/dd', { locale: ja }) : '未設定', [offer.respondDeadline])
  const paymentCompletedLabel = useMemo(() => offer.paidAt ? format(new Date(offer.paidAt), 'yyyy/MM/dd', { locale: ja }) : undefined, [offer.paidAt])

  const mainActionDetail = useMemo<StepDetail>(() => {
    const phase = resolveMainActionPhase({
      role: 'store',
      status: offer.status,
      invoiceStatus: offer.invoiceStatus,
      paid: offer.paid,
      reviewCompleted: offer.reviewCompleted,
    })

    switch (phase) {
      case 'invoice_waiting':
        return {
          title: '請求をお待ちしています',
          description: '請求書がまだ作成されていません。必要に応じてメッセージで作成・提出を案内してください。',
          badge: <Badge variant="outline">請求待ち</Badge>,
          meta: [{ label: '請求書ステータス', value: offer.invoiceStatusLabel }],
          primaryAction: undefined,
          secondaryAction: <Button variant="outline" asChild><a href="#offer-messages">メッセージを送る</a></Button>,
        }
      case 'invoice_submitted':
        return {
          title: '請求書が提出されました',
          description: '内容を確認し、問題なければ支払いへ進んでください。',
          badge: <Badge>確認が必要</Badge>,
          meta: [
            { label: '請求書ステータス', value: offer.invoiceStatusLabel },
            ...(invoice?.amount != null ? [{ label: '請求額', value: `¥${invoice.amount.toLocaleString('ja-JP')}` }] : []),
            { label: '支払い状況', value: offer.paymentStatusLabel },
          ],
          primaryAction: invoice ? <Button asChild><Link href={`/store/invoices/${invoice.id}`}>請求書を見る</Link></Button> : undefined,
          secondaryAction: <Button variant="outline" asChild><a href="#offer-messages">メッセージを送る</a></Button>,
        }
      case 'payment_waiting':
        return {
          title: '支払い処理を進めてください',
          description: '請求内容は確認済みです。次は支払いを完了し、レビューに進みましょう。',
          badge: <Badge variant="outline">支払い待ち</Badge>,
          meta: [
            { label: '支払い状況', value: offer.paymentStatusLabel },
            ...(invoice?.amount != null ? [{ label: '支払い予定額', value: `¥${invoice.amount.toLocaleString('ja-JP')}` }] : []),
          ],
          primaryAction: paymentLink ? <Button asChild><Link href={paymentLink}>支払いを確認する</Link></Button> : invoice ? <Button asChild><Link href={`/store/invoices/${invoice.id}`}>請求書を見る</Link></Button> : undefined,
          secondaryAction: <Button variant="outline" asChild><a href="#offer-messages">メッセージを送る</a></Button>,
        }
      case 'payment_completed_review_waiting':
        return {
          title: '支払いが完了しました',
          description: 'お疲れさまでした。次はレビューを投稿してください。',
          badge: <Badge variant="success">レビュー待ち</Badge>,
          meta: [
            { label: '支払い状況', value: offer.paymentStatusLabel },
            ...(paymentCompletedLabel ? [{ label: '支払い日', value: paymentCompletedLabel }] : []),
          ],
          primaryAction: offer.talentId ? (
            <ReviewModal
              offerId={offer.id}
              talentId={offer.talentId}
              trigger={<Button>レビューする</Button>}
              onSubmitted={handleReviewSubmitted}
            />
          ) : undefined,
          secondaryAction: <Button variant="outline" asChild><a href="#offer-messages">メッセージを送る</a></Button>,
        }
      case 'completed':
        return {
          title: '取引が完了しました',
          description: 'この案件はすべてのステップが完了しています。',
          badge: <Badge variant="success">全完了</Badge>,
          meta: [{ label: 'レビュー状態', value: offer.reviewCompleted ? 'レビュー済み' : '未実施' }],
          primaryAction: <Button asChild><Link href="/store/reviews">レビューを見る</Link></Button>,
          secondaryAction: <Button variant="outline" asChild><a href="#offer-messages">メッセージを送る</a></Button>,
        }
      default:
        return {
          title: '請求書の準備がこれからです',
          description: 'まだ請求書が作成されていない状態です。進行ステップバーで状況を確認してください。',
          badge: <Badge variant="outline">準備中</Badge>,
          meta: [{ label: '現在ステップ', value: activeStep }],
          secondaryAction: <Button variant="outline" asChild><a href="#offer-messages">メッセージを送る</a></Button>,
        }
    }
  }, [activeStep, offer.status, offer.invoiceStatus, offer.paid, offer.reviewCompleted, offer.invoiceStatusLabel, offer.paymentStatusLabel, offer.id, offer.talentId, invoice, paymentLink, paymentCompletedLabel, handleReviewSubmitted])

  const detail = useMemo<StepDetail>(() => {
    if (['invoice', 'payment', 'review'].includes(activeStep)) {
      const base = mainActionDetail
      return cancelation
        ? {
            ...base,
            footer: (
              <CancelOfferSection
                offerId={offer.id}
                initialStatus={cancelation.initialStatus}
                initialCanceledAt={cancelation.initialCanceledAt}
              />
            ),
          }
        : base
    }

    let result: StepDetail = {
      title: '進行中',
      description: '進行ステップを確認してください。',
      secondaryAction: <Button variant="outline" asChild><a href="#offer-messages">メッセージを送る</a></Button>,
    }

    if (activeStep === 'offer_submitted') {
      result = {
        title: 'オファー提出',
        description: '店舗からタレントへオファーを送信しました。返信内容はメッセージで確認できます。',
        badge: activeStatus === 'complete' ? <Badge variant="success">完了</Badge> : undefined,
        meta: [
          { label: '提出日時', value: formattedSubmittedAt },
          { label: 'オファー金額', value: offer.reward != null ? `¥${offer.reward.toLocaleString('ja-JP')}` : '未設定' },
          { label: '提出者', value: offer.storeName || '未設定' },
        ],
        secondaryAction: <Button variant="outline" asChild><a href="#offer-messages">メッセージを送る</a></Button>,
      }
    }

    if (activeStep === 'approval') {
      result = {
        title: '承認',
        description: '承認状況を確認し、必要に応じてメッセージで調整してください。',
        badge: statusBadge(offer.status),
        meta: [
          { label: '承認期限', value: formattedRespondDeadline },
          { label: '最終更新', value: formattedUpdatedAt },
        ],
        secondaryAction: <Button variant="outline" asChild><a href="#offer-messages">メッセージを送る</a></Button>,
      }
    }

    if (activeStep === 'visit') {
      result = {
        title: '来店実施',
        description: '来店日時と当日の連絡事項を確認してください。',
        badge: activeStatus === 'complete' ? <Badge variant="success">完了</Badge> : undefined,
        meta: [
          { label: '来店日時', value: formattedVisitDate },
          { label: '最終更新', value: formattedUpdatedAt },
        ],
        secondaryAction: <Button variant="outline" asChild><a href="#offer-messages">メッセージを送る</a></Button>,
      }
    }

    return cancelation
      ? {
          ...result,
          footer: (
            <CancelOfferSection
              offerId={offer.id}
              initialStatus={cancelation.initialStatus}
              initialCanceledAt={cancelation.initialCanceledAt}
            />
          ),
        }
      : result
  }, [activeStep, activeStatus, cancelation, formattedRespondDeadline, formattedSubmittedAt, formattedUpdatedAt, formattedVisitDate, mainActionDetail, offer.id, offer.reward, offer.status, offer.storeName])

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-2 border-b border-slate-100 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle className="text-lg font-semibold text-slate-900">{detail.title}</CardTitle>
          {detail.badge}
        </div>
        <p className="text-sm text-muted-foreground">{detail.description}</p>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {detail.meta && detail.meta.length > 0 && (
          <dl className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
            {detail.meta.map(item => (
              <div key={item.label} className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                <dd className="text-base font-semibold text-slate-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          {detail.secondaryAction && <div className="inline-flex">{detail.secondaryAction}</div>}
          {detail.primaryAction && <div className="inline-flex">{detail.primaryAction}</div>}
        </div>
        {detail.footer && <div className="space-y-4 border-t border-dashed border-slate-200 pt-4">{detail.footer}</div>}
      </CardContent>
    </Card>
  )
}
