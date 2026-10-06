'use client'

import { useCallback, useMemo, useState, type ReactNode } from 'react'
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
import { toast } from 'sonner'
import OfferNoShowSection from '@/components/offers/OfferNoShowSection'

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
    endTime: string | null
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
    initialCanceledByRole: string | null
    initialCancellationReason: string | null
    initialCancellationStage: string | null
  }
  noShow?: {
    initialNoShowAt: string | null
    initialNoShowReason: string | null
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

const primaryActionClass = 'h-11 w-full rounded-xl bg-[#FF5A1F] px-4 font-bold text-white hover:bg-[#E94F18] focus-visible:ring-orange-200 sm:w-auto'

const statusBadge = (status: string) => {
  switch (status) {
    case 'confirmed':
    case 'accepted':
      return <Badge>締結済み</Badge>
    case 'rejected':
      return <Badge variant="secondary">辞退済み</Badge>
    case 'canceled':
      return <Badge variant="destructive">キャンセル済み</Badge>
    case 'no_show':
      return <Badge variant="destructive">来店なし</Badge>
    default:
      return <Badge variant="outline">相談中</Badge>
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'confirmed':
    case 'accepted':
      return '締結済み'
    case 'rejected':
      return '辞退済み'
    case 'canceled':
      return 'キャンセル済み'
    case 'no_show':
      return '来店なし'
    default:
      return '相談中'
  }
}

export default function StepDetailCard({ activeStep, activeStatus, offer, invoice, paymentLink, cancelation, noShow }: StepDetailCardProps) {
  const router = useRouter()
  const [visitCompleting, setVisitCompleting] = useState(false)

  const handleReviewSubmitted = useCallback(() => {
    router.refresh()
  }, [router])

  const handleVisitComplete = useCallback(async () => {
    setVisitCompleting(true)
    try {
      const res = await fetch(`/api/offers/${offer.id}/visit-complete`, { method: 'POST' })
      const result = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(result?.message || '来店完了の記録に失敗しました')
      }

      toast.success('来店完了を記録しました')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '来店完了の記録に失敗しました')
    } finally {
      setVisitCompleting(false)
    }
  }, [offer.id, router])

  const formattedVisitDate = useMemo(() => offer.date ? format(new Date(offer.date), 'yyyy/MM/dd (EEE) HH:mm', { locale: ja }) : '未設定', [offer.date])
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
          title: '見積書をお待ちください',
          description: '演者と条件を相談し、見積書の提出をお待ちください。',
          badge: <Badge variant="outline">見積待ち</Badge>,
          meta: [{ label: '見積ステータス', value: offer.invoiceStatusLabel }],
          primaryAction: undefined,
        }
      case 'invoice_submitted':
        return {
          title: '見積書が提出されました',
          description: '内容を確認し、問題なければ見積を承認して取引を締結してください。',
          badge: <Badge>確認が必要</Badge>,
          meta: [
            { label: '見積ステータス', value: offer.invoiceStatusLabel },
            ...(invoice?.amount != null ? [{ label: '見積合計', value: `¥${invoice.amount.toLocaleString('ja-JP')}` }] : []),
          ],
          primaryAction: invoice ? <Button className={primaryActionClass} asChild><Link href={`/store/invoices/${invoice.id}`}>見積書を確認する</Link></Button> : undefined,
        }
      case 'payment_waiting':
        return {
          title: offer.status === 'completed' ? '来店が完了しました' : '取引が締結されました',
          description: offer.status === 'completed'
            ? '来店完了を確認しました。締結書兼請求書を確認し、支払いを進めてください。'
            : '見積内容で条件が確定し、取引締結書兼請求書が発行されています。来店後、支払いを進めてください。',
          badge: <Badge variant="success">{offer.status === 'completed' ? '来店完了' : '締結済み'}</Badge>,
          meta: [
            { label: '支払い状況', value: offer.paymentStatusLabel },
            ...(invoice?.amount != null ? [{ label: '支払い予定額', value: `¥${invoice.amount.toLocaleString('ja-JP')}` }] : []),
          ],
          primaryAction: paymentLink ? <Button className={primaryActionClass} asChild><Link href={paymentLink}>締結書兼請求書を見る</Link></Button> : invoice ? <Button className={primaryActionClass} asChild><Link href={`/store/invoices/${invoice.id}`}>締結書兼請求書を見る</Link></Button> : undefined,
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
              trigger={<Button className={primaryActionClass}>レビューする</Button>}
              onSubmitted={handleReviewSubmitted}
            />
          ) : undefined,
        }
      case 'completed':
        return {
          title: '取引が完了しました',
          description: 'この案件はすべてのステップが完了しています。',
          badge: <Badge variant="success">全完了</Badge>,
          meta: [{ label: 'レビュー状態', value: offer.reviewCompleted ? 'レビュー済み' : '未実施' }],
          primaryAction: <Button className={primaryActionClass} asChild><Link href="/store/reviews">レビューを見る</Link></Button>,
        }
      default:
        return {
          title: '請求書の準備がこれからです',
          description: 'まだ請求書が作成されていない状態です。進行ステップバーで状況を確認してください。',
          badge: <Badge variant="outline">準備中</Badge>,
          meta: [{ label: '現在ステップ', value: activeStep }],
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
                initialCanceledByRole={cancelation.initialCanceledByRole}
                initialCancellationReason={cancelation.initialCancellationReason}
                initialCancellationStage={cancelation.initialCancellationStage}
                invoiceId={invoice?.id ?? null}
              />
            ),
          }
        : base
    }

    let result: StepDetail = {
      title: '進行中',
      description: '進行ステップを確認してください。',
    }

    if (activeStep === 'offer_submitted') {
      result = {
        title: 'オファー・条件相談',
        description: '演者へオファーを送信しました。メッセージなどで条件を相談してください。',
        badge: activeStatus === 'complete' ? <Badge variant="success">完了</Badge> : undefined,
        meta: [
          { label: 'オファー金額', value: offer.reward != null ? `¥${offer.reward.toLocaleString('ja-JP')}` : '未設定' },
          { label: '提出者', value: offer.storeName || '未設定' },
        ],
      }
    }

    if (activeStep === 'approval') {
      result = {
        title: '見積',
        description: offer.invoiceStatus === 'submitted'
          ? '演者から見積書が届いています。内容を確認してください。'
          : '条件相談後、演者から見積書が提出されます。',
        badge: offer.invoiceStatus === 'submitted' ? <Badge>見積確認待ち</Badge> : statusBadge(offer.status),
        meta: [{ label: '案件状況', value: getStatusText(offer.status) }],
      }
    }

    if (activeStep === 'visit') {
      result = offer.status === 'no_show'
        ? {
            title: '来店なし',
            description: '予定終了後、店舗から来店なしとして記録されています。支払い・レビューには進みません。',
            badge: <Badge variant="destructive">来店なし</Badge>,
            meta: [{ label: '来店日時', value: formattedVisitDate }],
          }
        : {
            title: '来店実施',
            description: '来店日時と当日の連絡事項を確認し、来店後に完了を記録してください。',
            badge: activeStatus === 'complete' ? <Badge variant="success">完了</Badge> : undefined,
            meta: [{ label: '来店日時', value: formattedVisitDate }],
            primaryAction: ['accepted', 'confirmed', 'completed'].includes(offer.status) ? (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-xl border-slate-300 px-4 font-bold text-slate-800 hover:bg-slate-50 sm:w-auto"
                  asChild
                >
                  <Link href={`/store/offers/${offer.id}/materials`}>告知素材を見る</Link>
                </Button>
                {offer.status === 'confirmed' && (
                  <Button
                    className={primaryActionClass}
                    onClick={() => void handleVisitComplete()}
                    disabled={visitCompleting}
                  >
                    {visitCompleting ? '記録中...' : '来店完了にする'}
                  </Button>
                )}
              </div>
            ) : undefined,
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
  }, [activeStep, activeStatus, cancelation, formattedVisitDate, handleVisitComplete, mainActionDetail, offer.id, offer.reward, offer.status, offer.storeName, visitCompleting])

  return (
    <Card className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]">
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
          {detail.primaryAction && <div className="flex w-full sm:inline-flex sm:w-auto">{detail.primaryAction}</div>}
        </div>
        {detail.footer && <div className="space-y-4 border-t border-dashed border-slate-200 pt-4">{detail.footer}</div>}
        {activeStep === 'visit' && noShow && (
          <div className="border-t border-dashed border-slate-200 pt-4">
            <OfferNoShowSection
              role="store"
              offerId={offer.id}
              status={offer.status}
              scheduledEndAt={offer.endTime}
              noShowAt={noShow.initialNoShowAt}
              noShowReason={noShow.initialNoShowReason}
              invoiceId={invoice?.id ?? null}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
