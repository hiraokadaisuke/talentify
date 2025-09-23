import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OfferChatThread from '@/components/offer/OfferChatThread'
import OfferSummary from '@/components/offer/OfferSummary'
import OfferPaymentStatusCard from '@/components/offer/OfferPaymentStatusCard'
import OfferProgressTracker from '@/components/offer/OfferProgressTracker'
import CancelOfferSection from './CancelOfferSection'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getOfferProgress } from '@/utils/offerProgress'
import type { OfferStepKey } from '@/utils/offerProgress'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

type PageProps = {
  params: { id: string }
}

export default async function StoreOfferPage({ params }: PageProps) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('offers')
    .select(
      'id,status,date,updated_at,message,talent_id,user_id,canceled_at,paid,paid_at, talents(stage_name,avatar_url), stores(store_name)'
    )
    .eq('id', params.id)
    .single()

  if (!data || !user) {
    notFound()
  }

  const { data: invoice } = await supabase
    .from('invoices')
    .select('id,amount,invoice_url,status')
    .eq('offer_id', params.id)
    .maybeSingle()
  const invoiceStatus: 'not_submitted' | 'submitted' | 'paid' = invoice
    ? data.paid
      ? 'paid'
      : 'submitted'
    : 'not_submitted'
  const offer = {
    id: data.id as string,
    status: data.status as string,
    date: data.date as string,
    message: data.message as string,
    performerName: data.talents?.stage_name || '',
    performerAvatarUrl: data.talents?.avatar_url || null,
    storeName: data.stores?.store_name || '',
    updatedAt: data.updated_at as string,
    paid: data.paid as boolean,
    paidAt: data.paid_at as string | null,
    invoiceStatus,
  }

  const invoiceData = invoice
    ? {
        id: invoice.id as string,
        invoiceUrl: invoice.invoice_url as string | null,
        amount: invoice.amount as number,
        status: invoice.status as string,
      }
    : null

  const showActions = ['accepted', 'confirmed', 'completed'].includes(data.status as string)
  const paymentLink = showActions ? `/store/offers/${params.id}/payment` : undefined
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
            '店舗からタレントへオファーを送信しました。返信内容はメッセージで確認できます。',
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
        if (invoiceData) {
          actions.push(
            <Button key="invoice" variant="outline" size="sm" asChild>
              <Link href={`/store/invoices/${invoiceData.id}`}>請求書を見る</Link>
            </Button>,
          )
        }
        return {
          title: '請求',
          description,
          meta: [
            { label: '請求ステータス', value: invoiceStatusText[offer.invoiceStatus] },
            ...(invoiceData?.amount
              ? [{ label: '請求額', value: `¥${invoiceData.amount.toLocaleString('ja-JP')}` }]
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
          description: '支払い完了後にタレントへのレビューを記入できます。来店内容を振り返って評価を準備しましょう。',
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
    <div className="flex h-full flex-col gap-6 p-4 lg:flex-row">
      <div className="flex flex-1 flex-col gap-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>進捗状況</CardTitle>
            <p className="text-sm text-muted-foreground">オファーの進行状況と各ステップの対応内容を確認できます。</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <OfferProgressTracker steps={steps} />
            <div className="rounded-lg border bg-background p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">{detail.title}</h3>
                {detail.badge}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{detail.description}</p>
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
                <div className="mt-4 flex flex-wrap gap-2">
                  {detail.actions.map((action, index) => (
                    <div key={index} className="inline-flex">{action}</div>
                  ))}
                </div>
              )}
              {detail.note && <div className="mt-4 text-sm text-muted-foreground">{detail.note}</div>}
            </div>
          </CardContent>
        </Card>

        <Card>
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
            <CancelOfferSection
              offerId={offer.id}
              initialStatus={data.status}
              initialCanceledAt={data.canceled_at}
            />
          </CardContent>
        </Card>

        {invoiceData && (
          <OfferPaymentStatusCard
            title="請求"
            offerId={offer.id}
            paid={offer.paid}
            paidAt={offer.paidAt}
            invoice={invoiceData}
          />
        )}
      </div>

      <div className="flex w-full flex-col gap-4 lg:max-w-md xl:max-w-lg">
        <div>
          <h2 className="text-base font-semibold text-foreground">メッセージ</h2>
          <p className="text-sm text-muted-foreground">オファーに関する連絡は右のチャットから行えます。</p>
        </div>
        <div id="chat" className="flex-1 min-h-[520px]">
          <OfferChatThread
            offerId={offer.id}
            currentUserId={user.id}
            currentRole="store"
            paymentLink={paymentLink}
          />
        </div>
      </div>
    </div>
  )
}
