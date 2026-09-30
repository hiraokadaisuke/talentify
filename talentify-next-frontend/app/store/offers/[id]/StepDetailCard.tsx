'use client'

import { useCallback, useMemo, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { OfferProgressStatus, OfferStepKey } from '@/utils/offerProgress'
import type { OfferInvoiceProgressStatus } from '@/lib/invoices/status'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import CancelOfferSection from './CancelOfferSection'
import ReviewModal from '@/components/modals/ReviewModal'

type StepDetailCardProps = {
  activeStep: OfferStepKey
  activeStatus: OfferProgressStatus
  offer: {
    id: string
    status: string
    storeName: string
    date: string | null
    paid: boolean
    paidAt: string | null
    invoiceStatus: OfferInvoiceProgressStatus
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
  footer?: ReactNode
}

const primaryActionClass = 'min-h-10 bg-blue-700 px-4 text-white hover:bg-blue-800'

export default function StepDetailCard({ activeStep, activeStatus, offer, invoice, cancelation }: StepDetailCardProps) {
  const router = useRouter()
  const handleReviewSubmitted = useCallback(() => router.refresh(), [router])
  const formattedVisitDate = useMemo(
    () => offer.date ? format(new Date(offer.date), 'yyyy/MM/dd (EEE) HH:mm', { locale: ja }) : '未設定',
    [offer.date],
  )

  const detail = useMemo<StepDetail>(() => {
    let result: StepDetail

    if (activeStep === 'offer_consultation') {
      result = {
        title: 'オファー・条件相談',
        description: '演者とメッセージや電話で条件を確認してください。条件がまとまると演者から見積書が提出されます。',
        badge: offer.status === 'pending' ? <Badge variant="outline">相談中</Badge> : undefined,
        meta: [{ label: 'オファー金額（目安）', value: offer.reward != null ? `¥${offer.reward.toLocaleString('ja-JP')}` : '未設定' }],
      }
    } else if (activeStep === 'estimate') {
      if (offer.invoiceStatus === 'submitted' && invoice) {
        result = {
          title: '見積書が届いています',
          description: '内容を確認し、問題なければ「この見積内容で締結する」から承認してください。',
          badge: <Badge>確認が必要</Badge>,
          meta: [
            { label: '見積状態', value: offer.invoiceStatusLabel },
            ...(invoice.amount != null ? [{ label: '見積合計', value: `¥${invoice.amount.toLocaleString('ja-JP')}` }] : []),
          ],
          primaryAction: <Button className={primaryActionClass} asChild><Link href={`/store/invoices/${invoice.id}`}>見積書を確認する</Link></Button>,
        }
      } else {
        result = {
          title: offer.invoiceStatus === 'draft' ? '演者が見積書を作成中です' : '見積書をお待ちください',
          description: '条件相談後、演者から見積書が提出されます。',
          badge: <Badge variant="outline">{offer.invoiceStatusLabel}</Badge>,
        }
      }
    } else if (activeStep === 'contract') {
      const contracted = offer.invoiceStatus === 'approved' || offer.invoiceStatus === 'paid' || offer.status === 'confirmed' || offer.status === 'completed'
      result = {
        title: contracted ? '取引が締結されています' : '見積承認で取引締結',
        description: contracted ? '承認した見積内容が取引条件として確定し、取引締結書兼請求書が発行されています。' : '見積内容を承認すると、その条件で取引が締結されます。',
        badge: contracted ? <Badge variant="success">締結済み</Badge> : <Badge variant="outline">未締結</Badge>,
        primaryAction: contracted && invoice ? <Button className={primaryActionClass} asChild><Link href={`/store/invoices/${invoice.id}`}>締結書兼請求書を見る</Link></Button> : undefined,
      }
    } else if (activeStep === 'visit') {
      result = {
        title: '来店実施',
        description: '来店日時と当日の連絡事項を確認してください。',
        badge: activeStatus === 'complete' ? <Badge variant="success">完了</Badge> : <Badge variant="outline">来店予定</Badge>,
        meta: [{ label: '来店日時', value: formattedVisitDate }],
      }
    } else if (activeStep === 'payment') {
      result = {
        title: offer.paid ? '支払い完了' : '支払い',
        description: offer.paid ? '支払いは完了しています。' : '取引締結書兼請求書の内容に基づき、支払い後に完了を記録してください。',
        badge: offer.paid ? <Badge variant="success">支払済み</Badge> : <Badge variant="outline">未払い</Badge>,
        meta: [
          { label: '支払い状況', value: offer.paymentStatusLabel },
          ...(invoice?.amount != null ? [{ label: '請求額', value: `¥${invoice.amount.toLocaleString('ja-JP')}` }] : []),
        ],
        primaryAction: invoice ? <Button className={primaryActionClass} asChild><Link href={`/store/invoices/${invoice.id}`}>{offer.paid ? '締結書兼請求書を見る' : '支払い内容を確認する'}</Link></Button> : undefined,
      }
    } else {
      result = offer.reviewCompleted
        ? {
            title: '取引が完了しました',
            description: 'レビューまで完了しています。',
            badge: <Badge variant="success">全完了</Badge>,
            primaryAction: <Button className={primaryActionClass} asChild><Link href="/store/reviews">レビューを見る</Link></Button>,
          }
        : {
            title: 'レビューを投稿してください',
            description: '支払い完了後、演者へのレビューを投稿できます。',
            badge: <Badge variant="outline">レビュー待ち</Badge>,
            primaryAction: offer.talentId ? <ReviewModal offerId={offer.id} talentId={offer.talentId} trigger={<Button className={primaryActionClass}>レビューする</Button>} onSubmitted={handleReviewSubmitted} /> : undefined,
          }
    }

    return cancelation
      ? { ...result, footer: <CancelOfferSection offerId={offer.id} initialStatus={cancelation.initialStatus} initialCanceledAt={cancelation.initialCanceledAt} /> }
      : result
  }, [activeStep, activeStatus, offer, invoice, cancelation, formattedVisitDate, handleReviewSubmitted])

  return (
    <Card className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-1.5 border-b border-slate-100 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3"><CardTitle className="text-base font-semibold text-slate-900 sm:text-lg">{detail.title}</CardTitle>{detail.badge}</div>
        <p className="break-words text-sm leading-relaxed text-muted-foreground">{detail.description}</p>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-5">
        {detail.meta && <dl className="grid gap-3 text-sm sm:grid-cols-2">{detail.meta.map(item => <div key={item.label}><dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</dt><dd className="mt-0.5 font-semibold text-slate-900">{item.value}</dd></div>)}</dl>}
        {detail.primaryAction && <div className="flex w-full sm:justify-end">{detail.primaryAction}</div>}
        {detail.footer && <div className="space-y-4 border-t border-dashed border-slate-200 pt-4">{detail.footer}</div>}
      </CardContent>
    </Card>
  )
}
