'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import OfferChatThread from '@/components/offer/OfferChatThread'
import OfferSummary from '@/components/offer/OfferSummary'
import OfferPaymentStatusCard from '@/components/offer/OfferPaymentStatusCard'
import OfferProgressTracker from '@/components/offer/OfferProgressTracker'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getOfferProgress } from '@/utils/offerProgress'
import type { OfferStepKey } from '@/utils/offerProgress'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { toast } from 'sonner'

export default function TalentOfferPage() {
  const params = useParams<{ id: string }>()
  const supabase = createClient()
  const [offer, setOffer] = useState<any>(null)
  const [loaded, setLoaded] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<'accept' | 'decline' | null>(null)
  const [invoiceId, setInvoiceId] = useState<string | null>(null)

  const loadOffer = useCallback(async () => {
    const { data } = await supabase
      .from('offers')
      .select(
        'id,status,date,updated_at,message,talent_id,user_id,paid,paid_at, talents(stage_name,avatar_url), stores(store_name)'
      )
      .eq('id', params.id)
      .or('and(status.eq.canceled,accepted_at.not.is.null),status.neq.canceled')
      .single()
    if (data) {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('id,status')
        .eq('offer_id', params.id)
        .maybeSingle()
      const invoiceStatus: 'not_submitted' | 'submitted' | 'paid' = invoice
        ? data.paid
          ? 'paid'
          : 'submitted'
        : 'not_submitted'
      setOffer({
        id: data.id,
        status: data.status,
        date: data.date,
        message: data.message,
        performerName: data.talents?.stage_name || '',
        performerAvatarUrl: data.talents?.avatar_url || null,
        storeName: data.stores?.store_name || '',
        updatedAt: data.updated_at,
        paid: data.paid,
        paidAt: data.paid_at,
        invoiceStatus,
      })
      setInvoiceId(invoice?.id ?? null)
    } else {
      setOffer(null)
      setInvoiceId(null)
    }
    setLoaded(true)
  }, [params.id, supabase])

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()
      setUserId(userData.user?.id ?? null)
      await loadOffer()
    }
    init()
  }, [loadOffer, supabase])

  if (!userId || !loaded) {
    return <p className="p-4">Loading...</p>
  }

  if (!offer) {
    return <p className="p-4">オファーが見つかりません</p>
  }

  const handleAccept = async () => {
    if (offer.status !== 'pending') return
    setActionLoading('accept')
    setOffer({ ...offer, status: 'confirmed' })
    const { error } = await supabase
      .from('offers')
      .update({ status: 'confirmed' })
      .eq('id', offer.id)
    if (error) {
      toast.error('承諾に失敗しました')
      setOffer(prev => ({ ...prev, status: 'pending' }))
    } else {
      await loadOffer()
    }
    setActionLoading(null)
  }

  const handleDecline = async () => {
    if (offer.status !== 'pending') return
    setActionLoading('decline')
    setOffer({ ...offer, status: 'rejected' })
    const { error } = await supabase
      .from('offers')
      .update({ status: 'rejected' })
      .eq('id', offer.id)
    if (error) {
      toast.error('辞退に失敗しました')
      setOffer(prev => ({ ...prev, status: 'pending' }))
    } else {
      await loadOffer()
    }
    setActionLoading(null)
  }

  const showActions = ['accepted', 'confirmed', 'completed'].includes(offer.status)
  const invoiceLink = showActions
    ? invoiceId
      ? '/talent/invoices'
      : `/talent/invoices/new?offerId=${offer.id}`
    : undefined
  const invoiceText = invoiceId ? '請求履歴を見る' : '請求書を作成'
  const paymentLink = showActions ? `/talent/offers/${offer.id}/payment` : undefined
  const formattedUpdatedAt = format(new Date(offer.updatedAt), 'yyyy/MM/dd HH:mm', {
    locale: ja,
  })

  const renderStatusBadge = () => {
    if (offer.status === 'confirmed' || offer.status === 'accepted') {
      return <Badge>承認済み</Badge>
    }
    if (offer.status === 'rejected') {
      return <Badge variant="secondary">辞退済み</Badge>
    }
    if (offer.status === 'canceled') {
      return <Badge variant="destructive">キャンセル済み</Badge>
    }
    return <Badge variant="secondary">未承諾</Badge>
  }

  const { steps, current } = getOfferProgress({
    status: offer.status,
    invoiceStatus: offer.invoiceStatus,
    paid: offer.paid,
  })

  const formattedVisitDate = offer.date
    ? format(new Date(offer.date), 'yyyy/MM/dd (EEE) HH:mm', { locale: ja })
    : '未設定'

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

  const buildStepDetail = (step: OfferStepKey): StepDetail => {
    switch (step) {
      case 'offer_submitted':
        return {
          title: 'オファー提出',
          description:
            '店舗からオファーが届きました。内容を確認して、承諾または辞退を選択してください。',
          meta: [
            { label: '最終更新', value: formattedUpdatedAt },
            { label: '来店予定', value: formattedVisitDate },
          ],
          actions: [
            <Button key="message" variant="outline" size="sm" asChild>
              <a href="#chat">メッセージを送る</a>
            </Button>,
          ],
        }
      case 'approval': {
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
        return {
          title: '承認',
          description,
          badge: renderStatusBadge(),
          meta: [{ label: '最終更新', value: formattedUpdatedAt }],
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
          description = '来店が完了しました。請求内容の作成に進みましょう。'
        } else if (offer.status === 'confirmed') {
          description = '来店日程が確定しています。当日の流れや準備事項を店舗と共有してください。'
        } else if (offer.status === 'accepted') {
          description = '承諾済みです。来店日時の調整を完了させ、必要事項を確認しましょう。'
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
        if (!invoiceId) {
          description = '来店が完了したら請求書を作成してください。提出が完了すると店舗に通知されます。'
        } else if (offer.invoiceStatus === 'submitted') {
          description = '請求書を提出済みです。支払い状況が更新されるまでお待ちください。'
        } else if (offer.invoiceStatus === 'paid') {
          description = '支払いが完了しました。取引内容を確認し、レビューをチェックしましょう。'
        } else {
          description = '請求書のステータスを確認してください。必要に応じて修正を行いましょう。'
        }
        const actions: ReactNode[] = [
          <Button key="message" variant="outline" size="sm" asChild>
            <a href="#chat">メッセージを送る</a>
          </Button>,
        ]
        if (invoiceLink) {
          actions.push(
            <Button key="invoice" size="sm" asChild>
              <Link href={invoiceLink}>{invoiceText}</Link>
            </Button>,
          )
        }
        return {
          title: '請求',
          description,
          meta: [
            { label: '請求ステータス', value: invoiceStatusText[offer.invoiceStatus] },
            ...(invoiceId ? [{ label: '請求ID', value: invoiceId }] : []),
          ],
          actions,
        }
      }
      case 'payment': {
        const description = offer.paid
          ? '支払いが完了しました。取引内容を確認し、レビューに備えましょう。'
          : '店舗からの支払いを待っています。状況に変化があればメッセージで確認してください。'
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
          meta: [
            { label: '支払い状況', value: offer.paid ? '完了' : '未完了' },
            ...(offer.paidAt
              ? [{ label: '支払い日', value: format(new Date(offer.paidAt), 'yyyy/MM/dd', { locale: ja }) }]
              : []),
          ],
          actions,
        }
      }
      case 'review':
      default:
        return {
          title: 'レビュー',
          description: '支払いが完了すると店舗からのレビューを確認できます。フィードバックを次回に活かしましょう。',
          actions: [
            <Button key="message" variant="outline" size="sm" asChild>
              <a href="#chat">メッセージを送る</a>
            </Button>,
          ],
        }
    }
  }

  const detail = buildStepDetail(current)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-6">
          <Card className="shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle>進捗状況</CardTitle>
              <p className="text-sm text-muted-foreground">オファーの進行状況と次に行うアクションを確認できます。</p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="mx-auto w-full max-w-3xl">
                <OfferProgressTracker steps={steps} />
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
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {item.label}
                        </dt>
                        <dd className="text-sm font-semibold text-foreground">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {detail.actions && detail.actions.length > 0 && (
                  <div className="mt-6 flex flex-wrap justify-end gap-2">
                    {detail.actions.map((action, index) => (
                      <div key={index} className="inline-flex">{action}</div>
                    ))}
                  </div>
                )}
                {detail.note && <div className="mt-4 text-sm text-muted-foreground">{detail.note}</div>}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>オファー詳細</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <OfferSummary
                performerName={offer.performerName}
                performerAvatarUrl={offer.performerAvatarUrl}
                storeName={offer.storeName}
                date={offer.date}
                message={offer.message}
                invoiceStatus={offer.invoiceStatus}
              />
              {offer.status === 'pending' && (
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAccept}
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === 'accept' ? '承諾中...' : '承諾'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDecline}
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === 'decline' ? '辞退中...' : '辞退'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <OfferPaymentStatusCard paid={offer.paid} paidAt={offer.paidAt} />
        </div>

        <aside className="flex h-full flex-col gap-4 rounded-2xl border bg-card p-6 shadow-md" id="chat">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">メッセージ</h2>
            <p className="text-sm text-muted-foreground">店舗との連絡はチャットをご利用ください。</p>
          </div>
          <div className="flex-1 min-h-[520px]">
            <OfferChatThread
              offerId={offer.id}
              currentUserId={userId}
              currentRole="talent"
              paymentLink={paymentLink}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
