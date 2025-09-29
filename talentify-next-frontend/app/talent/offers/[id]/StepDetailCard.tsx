'use client'

import { useMemo, type ReactNode } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { OfferProgressStatus, OfferStepKey } from '@/utils/offerProgress'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

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
  }
  invoiceId: string | null
  paymentLink?: string
  onAcceptOffer?: () => void
  onDeclineOffer?: () => void
  actionLoading?: 'accept' | 'decline' | null
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

const statusDisplay = (status: string) => {
  switch (status) {
    case 'pending':
      return { text: '承認待ち', badge: <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">承認待ち</Badge> }
    case 'accepted':
      return { text: '承認済み', badge: <Badge variant="success">承認済み</Badge> }
    case 'confirmed':
      return { text: '来店予定', badge: <Badge variant="success">来店予定</Badge> }
    case 'completed':
      return { text: '完了', badge: <Badge variant="success">完了</Badge> }
    case 'rejected':
      return { text: '辞退済み', badge: <Badge variant="secondary">辞退済み</Badge> }
    case 'canceled':
      return { text: 'キャンセル済み', badge: <Badge variant="destructive">キャンセル済み</Badge> }
    default:
      return { text: '未承諾', badge: <Badge variant="secondary">未承諾</Badge> }
  }
}

export default function StepDetailCard({
  activeStep,
  activeStatus,
  offer,
  invoiceId,
  paymentLink,
  onAcceptOffer,
  onDeclineOffer,
  actionLoading,
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

  const paymentCompletedLabel = useMemo(() => {
    return offer.paidAt ? format(new Date(offer.paidAt), 'yyyy/MM/dd', { locale: ja }) : undefined
  }, [offer.paidAt])

  const detail = useMemo<StepDetail>(() => {
    switch (activeStep) {
      case 'offer_submitted':
        return {
          title: 'オファー提出',
          description: '店舗からオファーが届きました。内容を確認して、承諾または辞退を選択してください。',
          badge: activeStatus === 'complete' ? <Badge variant="success">完了</Badge> : undefined,
          meta: [
            { label: '提出日時', value: formattedSubmittedAt },
            { label: '来店予定', value: formattedVisitDate },
          ],
          actions: [
            <Button key="message" variant="outline" size="sm" asChild>
              <a href="#offer-messages">メッセージを送る</a>
            </Button>,
          ],
        }
      case 'approval': {
        const status = statusDisplay(offer.status)
        let description = ''
        switch (offer.status) {
          case 'pending':
            description = '承諾または辞退を選択してください。追加の質問があればメッセージで確認しましょう。'
            break
          case 'accepted':
            description = '承諾済みです。店舗との連絡を取り、来店日時の最終確認を行いましょう。'
            break
          case 'confirmed':
            description = '承認が完了し、来店準備へ進めます。必要事項をメッセージで共有してください。'
            break
          case 'rejected':
            description = 'オファーを辞退済みです。他の案件を確認しましょう。'
            break
          case 'canceled':
            description = '店舗によりオファーがキャンセルされました。状況をメッセージで確認してください。'
            break
          default:
            description = '承認が完了しました。次のステップに進んでください。'
            break
        }
        const actions: ReactNode[] = []
        if (offer.status === 'pending') {
          if (onAcceptOffer) {
            actions.push(
              <Button
                key="accept"
                variant="default"
                size="sm"
                onClick={onAcceptOffer}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'accept' ? '承諾中...' : '承諾'}
              </Button>,
            )
          }
          if (onDeclineOffer) {
            actions.push(
              <Button
                key="decline"
                variant="outline"
                size="sm"
                onClick={onDeclineOffer}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'decline' ? '辞退中...' : '辞退'}
              </Button>,
            )
          }
        }
        actions.push(
          <Button key="message" variant="outline" size="sm" asChild>
            <a href="#offer-messages">メッセージを送る</a>
          </Button>,
        )
        return {
          title: '承認',
          description,
          badge: status.badge,
          meta: [
            { label: 'ステータス', value: status.text },
            { label: '最終更新', value: formattedUpdatedAt },
          ],
          actions,
        }
      }
      case 'visit': {
        let description = ''
        if (offer.status === 'completed') {
          description = '来店が完了しました。請求内容の作成に進みましょう。'
        } else if (offer.status === 'confirmed') {
          description = '来店日程が確定しています。当日の流れや準備事項を店舗と共有してください。'
        } else if (offer.status === 'accepted') {
          description = '承済みです。来店日時の調整を完了させ、必要事項を確認しましょう。'
        } else if (offer.status === 'canceled') {
          description = 'オファーがキャンセルされたため、来店は行われません。'
        } else if (offer.status === 'rejected') {
          description = '辞退済みのため、来店は予定されていません。'
        } else {
          description = '来店日時を調整し、詳細を店舗と共有しましょう。'
        }
        return {
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
      }
      case 'invoice': {
        let description = ''
        if (!invoiceId) {
          description = '来店が完了したら請求書を作成してください。提出が完了すると店舗に通知されます。'
        } else if (offer.invoiceStatus === 'submitted') {
          description = '請求書を提出済みです。支払い状況が更新されるまでお待ちください。'
        } else if (offer.invoiceStatus === 'paid') {
          description = '支払いが完了しました。取引内容を確認し、レビューをチェックしましょう。'
        } else {
          description = '請求書のステータスを確認してください。必要に応じて修正を行いましょう。'
        }
        const actions: ReactNode[] = []
        if (!invoiceId) {
          actions.push(
            <Button key="create" size="sm" asChild>
              <Link href={`/talent/invoices/new?offerId=${offer.id}`}>請求書を作成</Link>
            </Button>,
          )
        } else {
          actions.push(
            <Button key="view" size="sm" variant="outline" asChild>
              <Link href="/talent/invoices">請求書を確認</Link>
            </Button>,
          )
        }
        actions.push(
          <Button key="message" variant="outline" size="sm" asChild>
            <a href="#offer-messages">メッセージを送る</a>
          </Button>,
        )
        let badge: ReactNode | undefined
        if (offer.invoiceStatus === 'paid') {
          badge = <Badge variant="success">支払済み</Badge>
        } else if (offer.invoiceStatus === 'submitted') {
          badge = <Badge>提出済み</Badge>
        } else if (activeStatus === 'current') {
          badge = (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
              準備中
            </Badge>
          )
        }
        return {
          title: '請求',
          description,
          badge,
          meta: [
            { label: '請求書', value: invoiceId ? '作成済み' : '未作成' },
            { label: 'ステータス', value: invoiceStatusText[offer.invoiceStatus] },
          ],
          actions,
          note:
            invoiceId === null
              ? '来店が完了してから請求書を作成してください。早めの提出で支払いもスムーズになります。'
              : undefined,
        }
      }
      case 'payment': {
        const actions: ReactNode[] = []
        if (paymentLink) {
          actions.push(
            <Button key="payment" size="sm" asChild>
              <Link href={paymentLink}>支払い状況を確認</Link>
            </Button>,
          )
        }
        actions.push(
          <Button key="message" variant="outline" size="sm" asChild>
            <a href="#offer-messages">メッセージを送る</a>
          </Button>,
        )
        let badge: ReactNode | undefined
        if (offer.paid) {
          badge = <Badge variant="success">完了</Badge>
        } else if (activeStatus === 'current') {
          badge = (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
              支払い待ち
            </Badge>
          )
        }
        return {
          title: '支払い',
          description: offer.paid
            ? '支払いが完了しました。入金内容を確認し、レビューが届くまでお待ちください。'
            : '請求書の支払いを待っています。状況を確認し、必要であれば店舗に連絡しましょう。',
          badge,
          meta: [
            { label: '支払い状況', value: offer.paid ? '完了' : '未完了' },
            ...(paymentCompletedLabel ? [{ label: '支払い日', value: paymentCompletedLabel }] : []),
          ],
          actions,
        }
      }
      case 'review':
      default:
        return {
          title: 'レビュー',
          description: '支払いが完了すると店舗からのレビューを確認できます。フィードバックを次回に活かしましょう。',
          badge: activeStatus === 'complete' ? <Badge variant="success">完了</Badge> : undefined,
          actions: [
            <Button key="message" variant="outline" size="sm" asChild>
              <a href="#offer-messages">メッセージを送る</a>
            </Button>,
          ],
        }
    }
  }, [
    activeStatus,
    activeStep,
    formattedSubmittedAt,
    formattedUpdatedAt,
    formattedVisitDate,
    invoiceId,
    offer.id,
    offer.invoiceStatus,
    offer.paid,
    offer.status,
    paymentCompletedLabel,
    paymentLink,
    onAcceptOffer,
    onDeclineOffer,
    actionLoading,
  ])

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
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            {detail.meta.map(item => (
              <div key={item.label} className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                <dd className="text-base font-semibold text-slate-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {detail.actions && detail.actions.length > 0 && (
          <div className="flex flex-wrap justify-end gap-2">
            {detail.actions.map((action, index) => (
              <div key={index} className="inline-flex">{action}</div>
            ))}
          </div>
        )}
        {detail.note && <div className="text-sm text-muted-foreground">{detail.note}</div>}
      </CardContent>
    </Card>
  )
}

