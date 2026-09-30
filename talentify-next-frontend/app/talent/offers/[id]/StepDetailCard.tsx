'use client'

import { useMemo, type ReactNode } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { OfferProgressStatus, OfferStepKey } from '@/utils/offerProgress'
import type { OfferInvoiceProgressStatus } from '@/lib/invoices/status'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

type StepDetailCardProps = {
  activeStep: OfferStepKey
  activeStatus: OfferProgressStatus
  offer: {
    id: string
    status: string
    date: string | null
    paid: boolean
    paidAt: string | null
    invoiceStatus: OfferInvoiceProgressStatus
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

const primaryActionClass = 'min-h-10 bg-blue-700 px-4 text-white hover:bg-blue-800'
const secondaryActionClass = 'min-h-10 border-slate-300 bg-white px-4 text-slate-700 hover:bg-slate-100'

export default function StepDetailCard({
  activeStep,
  activeStatus,
  offer,
  invoiceId,
  onDeclineOffer,
  actionLoading,
}: StepDetailCardProps) {
  const formattedVisitDate = useMemo(
    () => offer.date ? format(new Date(offer.date), 'yyyy/MM/dd (EEE) HH:mm', { locale: ja }) : '未設定',
    [offer.date],
  )

  const detail = useMemo<StepDetail>(() => {
    if (activeStep === 'offer_consultation') {
      return {
        title: 'オファー・条件相談',
        description: 'メッセージや必要に応じて電話で条件を確認し、まとまったら見積書を提出してください。',
        badge: offer.status === 'pending' ? <Badge variant="outline">相談中</Badge> : undefined,
        meta: [{ label: '来店予定', value: formattedVisitDate }],
        primaryAction:
          offer.status === 'pending' && !['submitted', 'approved', 'paid'].includes(offer.invoiceStatus)
            ? <Button className={primaryActionClass} asChild><Link href={invoiceId ? `/talent/invoices/${invoiceId}` : `/talent/invoices/new?offerId=${offer.id}`}>見積書を作成する</Link></Button>
            : undefined,
        secondaryAction:
          offer.status === 'pending' && onDeclineOffer
            ? <Button variant="outline" className={secondaryActionClass} onClick={onDeclineOffer} disabled={actionLoading === 'decline'}>{actionLoading === 'decline' ? '処理中...' : '今回は対応できない'}</Button>
            : undefined,
      }
    }

    if (activeStep === 'estimate') {
      if (offer.invoiceStatus === 'submitted') {
        return {
          title: '見積書を提出しました',
          description: 'ホール側の確認待ちです。修正依頼があった場合は内容を調整して再提出してください。',
          badge: <Badge>ホール確認待ち</Badge>,
          primaryAction: invoiceId ? <Button variant="outline" className={secondaryActionClass} asChild><Link href={`/talent/invoices/${invoiceId}`}>提出した見積を見る</Link></Button> : undefined,
        }
      }
      if (offer.invoiceStatus === 'approved' || offer.invoiceStatus === 'paid') {
        return {
          title: '見積書が承認されました',
          description: '見積内容で取引が締結され、取引締結書兼請求書が発行されています。',
          badge: <Badge variant="success">締結済み</Badge>,
          primaryAction: invoiceId ? <Button className={primaryActionClass} asChild><Link href={`/talent/invoices/${invoiceId}`}>締結書兼請求書を見る</Link></Button> : undefined,
        }
      }
      return {
        title: '見積書を作成してください',
        description: '出演料・交通費・追加費用・支払期限など、相談した内容を見積書にまとめて提出してください。',
        badge: <Badge variant="outline">{offer.invoiceStatus === 'draft' ? '下書きあり' : '未提出'}</Badge>,
        primaryAction: <Button className={primaryActionClass} asChild><Link href={invoiceId ? `/talent/invoices/${invoiceId}` : `/talent/invoices/new?offerId=${offer.id}`}>{invoiceId ? '見積書を編集する' : '見積書を作成する'}</Link></Button>,
      }
    }

    if (activeStep === 'contract') {
      const contracted = offer.invoiceStatus === 'approved' || offer.invoiceStatus === 'paid' || offer.status === 'confirmed' || offer.status === 'completed'
      return {
        title: contracted ? '取引が締結されています' : '見積承認で締結',
        description: contracted ? 'ホールが見積内容を承認し、取引条件が確定しました。' : 'ホールが見積書を承認すると、この条件で取引が締結されます。',
        badge: contracted ? <Badge variant="success">締結済み</Badge> : <Badge variant="outline">未締結</Badge>,
        primaryAction: contracted && invoiceId ? <Button className={primaryActionClass} asChild><Link href={`/talent/invoices/${invoiceId}`}>締結書兼請求書を見る</Link></Button> : undefined,
      }
    }

    if (activeStep === 'visit') {
      return {
        title: '来店実施',
        description: '来店日時と当日の連絡事項を確認してください。',
        badge: activeStatus === 'complete' ? <Badge variant="success">完了</Badge> : <Badge variant="outline">来店予定</Badge>,
        meta: [{ label: '来店日時', value: formattedVisitDate }],
      }
    }

    if (activeStep === 'payment') {
      return {
        title: offer.paid ? '支払いが完了しました' : '支払いをお待ちしています',
        description: offer.paid ? 'ホール側で支払い完了が記録されています。' : '取引締結書兼請求書に基づく支払いをお待ちください。',
        badge: offer.paid ? <Badge variant="success">支払済み</Badge> : <Badge variant="outline">支払い待ち</Badge>,
        meta: [{ label: '支払い状態', value: offer.paymentStatusLabel }],
        primaryAction: invoiceId ? <Button variant="outline" className={secondaryActionClass} asChild><Link href={`/talent/invoices/${invoiceId}`}>締結書兼請求書を見る</Link></Button> : undefined,
      }
    }

    return {
      title: offer.reviewCompleted ? 'レビューが届いています' : 'レビュー待ち',
      description: offer.reviewCompleted ? 'ホールからのレビューを確認できます。' : '支払い完了後、ホールからのレビューをお待ちください。',
      badge: offer.reviewCompleted ? <Badge variant="success">レビューあり</Badge> : <Badge variant="outline">未実施</Badge>,
      primaryAction: offer.reviewCompleted ? <Button className={primaryActionClass} asChild><Link href="/talent/reviews">レビューを確認する</Link></Button> : undefined,
    }
  }, [activeStep, activeStatus, offer, invoiceId, onDeclineOffer, actionLoading, formattedVisitDate])

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
        {detail.meta && <dl className="grid gap-3 text-sm sm:grid-cols-2">{detail.meta.map(item => <div key={item.label}><dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</dt><dd className="mt-0.5 font-semibold text-slate-900">{item.value}</dd></div>)}</dl>}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:justify-end">
          {detail.secondaryAction && <div className="flex w-full sm:w-auto">{detail.secondaryAction}</div>}
          {detail.primaryAction && <div className="flex w-full sm:w-auto">{detail.primaryAction}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
