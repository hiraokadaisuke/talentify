'use client'

import { useMemo, type ReactNode } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { OfferProgressStatus, OfferStepKey } from '@/utils/offerProgress'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import CancelOfferSection from './CancelOfferSection'

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
    reward: number | null
  }
  invoice?: {
    id: string
    invoiceUrl: string | null
    amount: number | null
    status: string
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
  actions?: ReactNode[]
  note?: ReactNode
  footer?: ReactNode
}

const invoiceStatusText: Record<'not_submitted' | 'submitted' | 'paid', string> = {
  not_submitted: '未提出',
  submitted: '提出済み',
  paid: '支払済み',
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

export default function StepDetailCard({
  activeStep,
  activeStatus,
  offer,
  invoice,
  paymentLink,
  cancelation,
}: StepDetailCardProps) {
  const formattedSubmittedAt = useMemo(() => {
    return offer.submittedAt
      ? format(new Date(offer.submittedAt), 'yyyy/MM/dd HH:mm', { locale: ja })
      : '未提出'
  }, [offer.submittedAt])

  const formattedUpdatedAt = useMemo(() => {
    return format(new Date(offer.updatedAt), 'yyyy/MM/dd HH:mm', { locale: ja })
  }, [offer.updatedAt])

  const formattedVisitDate = useMemo(() => {
    return offer.date ? format(new Date(offer.date), 'yyyy/MM/dd (EEE) HH:mm', { locale: ja }) : '未設定'
  }, [offer.date])

  const formattedRespondDeadline = useMemo(() => {
    return offer.respondDeadline
      ? format(new Date(offer.respondDeadline), 'yyyy/MM/dd', { locale: ja })
      : '未設定'
  }, [offer.respondDeadline])

  const paymentCompletedLabel = useMemo(() => {
    return offer.paidAt ? format(new Date(offer.paidAt), 'yyyy/MM/dd', { locale: ja }) : undefined
  }, [offer.paidAt])

  const buildStepDetail = useMemo<StepDetail>(() => {
    let detail: StepDetail
    switch (activeStep) {
      case 'offer_submitted':
        detail = {
          title: 'オファー提出',
          description: '店舗からタレントへオファーを送信しました。返信内容はメッセージで確認できます。',
          badge: activeStatus === 'complete' ? <Badge variant="success">完了</Badge> : undefined,
          meta: [
            { label: '提出日時', value: formattedSubmittedAt },
            { label: 'オファー金額', value: offer.reward != null ? `¥${offer.reward.toLocaleString('ja-JP')}` : '未設定' },
            { label: '提出者', value: offer.storeName || '未設定' },
          ],
          actions: [
            <Button key="message" variant="outline" size="sm" asChild>
              <a href="#offer-messages">メッセージを送る</a>
            </Button>,
          ],
        }
        break
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
            description = '承認手続きが進行中です。ステータスを確認して次のステップへ進みましょう。'
            break
        }
        detail = {
          title: '承認',
          description,
          badge: statusBadge(offer.status),
          meta: [
            { label: '承認期限', value: formattedRespondDeadline },
            { label: '最終更新', value: formattedUpdatedAt },
          ],
          actions: [
            <Button key="message" variant="outline" size="sm" asChild>
              <a href="#offer-messages">メッセージを送る</a>
            </Button>,
          ],
        }
        break
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
        detail = {
          title: '来店実施',
          description,
          badge: activeStatus === 'complete' ? <Badge variant="success">完了</Badge> : undefined,
          meta: [
            { label: '来店日時', value: formattedVisitDate },
            { label: '最終更新', value: formattedUpdatedAt },
          ],
          actions: [
            <Button key="message" variant="outline" size="sm" asChild>
              <a href="#offer-messages">メッセージを送る</a>
            </Button>,
          ],
        }
        break
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
            <a href="#offer-messages">メッセージを送る</a>
          </Button>,
        ]
        if (invoice) {
          actions.push(
            <Button key="invoice" variant="outline" size="sm" asChild>
              <Link href={`/store/invoices/${invoice.id}`}>請求書を見る</Link>
            </Button>,
          )
          if (invoice.invoiceUrl) {
            actions.push(
              <Button key="download" variant="outline" size="sm" asChild>
                <a href={invoice.invoiceUrl} target="_blank" rel="noreferrer">
                  請求書を開く
                </a>
              </Button>,
            )
          }
        }
        detail = {
          title: '請求',
          description,
          badge: activeStatus === 'complete' ? <Badge variant="success">完了</Badge> : undefined,
          meta: [
            { label: '請求ステータス', value: invoiceStatusText[offer.invoiceStatus] },
            ...(invoice?.amount != null
              ? [{ label: '請求額', value: `¥${invoice.amount.toLocaleString('ja-JP')}` }]
              : []),
          ],
          actions,
        }
        break
      }
      case 'payment': {
        const description = offer.paid
          ? '支払いが完了しました。必要に応じてレビューの準備を進めてください。'
          : '請求内容を確認し、支払いを完了してください。支払いが完了するとレビューに進めます。'
        const actions: ReactNode[] = [
          <Button key="message" variant="outline" size="sm" asChild>
            <a href="#offer-messages">メッセージを送る</a>
          </Button>,
        ]
        if (paymentLink) {
          actions.push(
            <Button key="payment" size="sm" asChild>
              <Link href={paymentLink}>支払い状況</Link>
            </Button>,
          )
        }
        detail = {
          title: '支払い',
          description,
          badge: offer.paid ? <Badge variant="success">完了</Badge> : undefined,
          meta: [
            { label: '支払い状況', value: offer.paid ? '完了' : '未完了' },
            ...(paymentCompletedLabel ? [{ label: '支払い日', value: paymentCompletedLabel }] : []),
          ],
          actions,
        }
        break
      }
      case 'review':
      default:
        detail = {
          title: 'レビュー',
          description:
            '支払い完了後にタレントへのレビューを記入できます。来店内容を振り返って評価を準備しましょう。',
          badge: activeStatus === 'complete' ? <Badge variant="success">完了</Badge> : undefined,
          actions: [
            <Button key="message" variant="outline" size="sm" asChild>
              <a href="#offer-messages">メッセージを送る</a>
            </Button>,
          ],
        }
        break
    }
    if (cancelation) {
      detail = {
        ...detail,
        footer: (
          <CancelOfferSection
            offerId={offer.id}
            initialStatus={cancelation.initialStatus}
            initialCanceledAt={cancelation.initialCanceledAt}
          />
        ),
      }
    }

    return detail
  }, [
    activeStatus,
    activeStep,
    formattedRespondDeadline,
    formattedSubmittedAt,
    formattedUpdatedAt,
    formattedVisitDate,
    invoice,
    offer.id,
    offer.invoiceStatus,
    offer.paid,
    offer.reward,
    offer.status,
    offer.storeName,
    paymentCompletedLabel,
    paymentLink,
    cancelation,
  ])

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-2 border-b border-slate-100 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle className="text-lg font-semibold text-slate-900">{buildStepDetail.title}</CardTitle>
          {buildStepDetail.badge}
        </div>
        <p className="text-sm text-muted-foreground">{buildStepDetail.description}</p>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {buildStepDetail.meta && buildStepDetail.meta.length > 0 && (
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            {buildStepDetail.meta.map(item => (
              <div key={item.label} className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                <dd className="text-base font-semibold text-slate-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {buildStepDetail.actions && buildStepDetail.actions.length > 0 && (
          <div className="flex flex-wrap justify-end gap-2">
            {buildStepDetail.actions.map((action, index) => (
              <div key={index} className="inline-flex">{action}</div>
            ))}
          </div>
        )}
        {buildStepDetail.note}
        {buildStepDetail.footer && (
          <div className="space-y-4 border-t border-dashed border-slate-200 pt-4">
            {buildStepDetail.footer}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
