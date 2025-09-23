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
import type { OfferProgressStatus, OfferStepKey } from '@/utils/offerProgress'
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
  const [activeStep, setActiveStep] = useState<OfferStepKey>('offer_submitted')

  const loadOffer = useCallback(async () => {
    const { data } = await supabase
      .from('offers')
      .select(
        'id,status,date,updated_at,created_at,message,talent_id,user_id,paid,paid_at, talents(stage_name,avatar_url), stores(store_name)'
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
        submittedAt: data.created_at,
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

  useEffect(() => {
    if (!offer) {
      setActiveStep('offer_submitted')
      return
    }

    const { current: currentStep } = getOfferProgress({
      status: offer.status,
      invoiceStatus: offer.invoiceStatus,
      paid: offer.paid,
    })
    setActiveStep(currentStep)
  }, [offer])

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
  const paymentLink = showActions ? `/talent/offers/${offer.id}/payment` : undefined
  const formattedUpdatedAt = format(new Date(offer.updatedAt), 'yyyy/MM/dd HH:mm', {
    locale: ja,
  })
  const formattedSubmittedAt = offer.submittedAt
    ? format(new Date(offer.submittedAt), 'yyyy/MM/dd HH:mm', { locale: ja })
    : '未提出'

  const statusDisplay = (() => {
    switch (offer.status) {
      case 'pending':
        return {
          text: '承認待ち',
          badge: (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
              承認待ち
            </Badge>
          ),
        }
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
  })()

  const { steps } = getOfferProgress({
    status: offer.status,
    invoiceStatus: offer.invoiceStatus,
    paid: offer.paid,
  })

  const formattedVisitDate = offer.date
    ? format(new Date(offer.date), 'yyyy/MM/dd (EEE) HH:mm', { locale: ja })
    : '未設定'
  const submittedDateLabel = offer.submittedAt
    ? format(new Date(offer.submittedAt), 'yyyy/MM/dd', { locale: ja })
    : null
  const approvalDeadlineLabel = offer.date
    ? format(new Date(offer.date), 'yyyy/MM/dd', { locale: ja })
    : null
  const paymentCompletedLabel = offer.paidAt
    ? format(new Date(offer.paidAt), 'yyyy/MM/dd', { locale: ja })
    : undefined

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

  const progressSteps = steps.map(step => {
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

  const activeStepStatus = progressSteps.find(step => step.key === activeStep)?.status ?? 'upcoming'

  const buildStepDetail = (step: OfferStepKey, status: OfferProgressStatus): StepDetail => {
    switch (step) {
      case 'offer_submitted':
        return {
          title: 'オファー提出',
          description:
            '店舗からオファーが届きました。内容を確認して、承諾または辞退を選択してください。',
          badge: status === 'complete' ? <Badge variant="success">完了</Badge> : undefined,
          meta: [
            { label: '提出日時', value: formattedSubmittedAt },
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
          badge: statusDisplay.badge,
          meta: [
            { label: 'ステータス', value: statusDisplay.text },
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
            <a href="#chat">メッセージを送る</a>
          </Button>,
        )
        let badge: ReactNode | undefined
        if (offer.invoiceStatus === 'paid') {
          badge = <Badge variant="success">支払済み</Badge>
        } else if (offer.invoiceStatus === 'submitted') {
          badge = <Badge>提出済み</Badge>
        } else if (status === 'current') {
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
            <a href="#chat">メッセージを送る</a>
          </Button>,
        )
        let badge: ReactNode | undefined
        if (offer.paid) {
          badge = <Badge variant="success">完了</Badge>
        } else if (status === 'current') {
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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">進捗状況</h2>
              <p className="text-sm text-muted-foreground">オファーの進行状況と次に行うアクションを確認できます。</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {statusDisplay.badge}
                <span className="text-xs text-muted-foreground">最終更新: {formattedUpdatedAt}</span>
              </div>
              <span className="text-xs text-muted-foreground">提出日時: {formattedSubmittedAt}</span>
            </div>
            <div className="w-full">
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
                    <div key={index} className="inline-flex">{action}</div>
                  ))}
                </div>
              )}
              {detail.note && <div className="mt-4 text-sm text-muted-foreground">{detail.note}</div>}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-8">
          <div className="flex flex-col gap-6">
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

          <aside className="flex h-full flex-col" id="chat">
            <OfferChatThread
              offerId={offer.id}
              currentUserId={userId}
              currentRole="talent"
              storeName={offer.storeName}
              talentName={offer.performerName}
              className="lg:h-[600px] lg:max-h-[70vh]"
            />
          </aside>
        </div>
      </div>
    </div>
  )
}
