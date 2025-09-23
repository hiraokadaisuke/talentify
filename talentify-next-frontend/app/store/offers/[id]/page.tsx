import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import OfferChatThread from '@/components/offer/OfferChatThread'
import CancelOfferSection from './CancelOfferSection'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getOfferProgress } from '@/utils/offerProgress'
import StoreOfferProgressPanel from './StoreOfferProgressPanel'

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
      'id,status,date,respond_deadline,reward,created_at,updated_at,message,talent_id,user_id,canceled_at,paid,paid_at, talents(stage_name,avatar_url), stores(store_name)'
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
    respondDeadline: data.respond_deadline as string | null,
    submittedAt: data.created_at as string | null,
    message: data.message as string,
    performerName: data.talents?.stage_name || '',
    performerAvatarUrl: data.talents?.avatar_url || null,
    storeName: data.stores?.store_name || '',
    updatedAt: data.updated_at as string,
    paid: data.paid as boolean,
    paidAt: data.paid_at as string | null,
    invoiceStatus,
    reward: data.reward as number | null,
  }

  const invoiceData = invoice
    ? {
        id: invoice.id as string,
        invoiceUrl: invoice.invoice_url as string | null,
        amount: invoice.amount as number | null,
        status: invoice.status as string,
      }
    : null

  const showActions = ['accepted', 'confirmed', 'completed'].includes(data.status as string)
  const paymentLink = showActions ? `/store/offers/${params.id}/payment` : undefined

  const { steps, current } = getOfferProgress({
    status: offer.status,
    invoiceStatus: offer.invoiceStatus,
    paid: offer.paid,
  })

  const formattedUpdatedAt = format(new Date(offer.updatedAt), 'yyyy/MM/dd HH:mm', { locale: ja })
  const formattedSubmittedAt = offer.submittedAt
    ? format(new Date(offer.submittedAt), 'yyyy/MM/dd HH:mm', { locale: ja })
    : '未提出'

  const statusLabel = getStatusLabel(offer.status)
  const statusClassName = getStatusBadgeClassName(offer.status)

  return (
    <div className="bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">オファー詳細</h1>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{offer.performerName || 'タレント未設定'}</span>
                  <span className="text-slate-300">/</span>
                  <span>{offer.storeName || '店舗未設定'}</span>
                </div>
                <span className="inline-flex h-4 w-px bg-slate-200" aria-hidden="true" />
                <span>{formattedSubmittedAt}</span>
                <Badge className={cn('flex items-center gap-1', statusClassName)}>{statusLabel}</Badge>
              </div>
            </div>
            <div className="text-xs text-slate-500 md:text-right">
              <div className="font-medium text-slate-400">最終更新日時</div>
              <div>{formattedUpdatedAt}</div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-slate-900">進捗状況</h2>
              <p className="text-sm text-muted-foreground">
                オファーの進行状況と各ステップの対応内容を確認できます。
              </p>
            </div>
            <StoreOfferProgressPanel
              steps={steps}
              currentStep={current}
              offer={{
                id: offer.id,
                status: offer.status,
                date: offer.date,
                respondDeadline: offer.respondDeadline,
                updatedAt: offer.updatedAt,
                submittedAt: offer.submittedAt,
                paid: offer.paid,
                paidAt: offer.paidAt,
                invoiceStatus: offer.invoiceStatus,
              }}
              invoice={invoiceData}
              paymentLink={paymentLink}
            />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-8">
          <div className="flex flex-col gap-6">
            <Card className="rounded-lg border border-slate-200 bg-white p-0 shadow-sm">
              <CardHeader className="mb-0 flex flex-col gap-2 border-b border-slate-100 p-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-lg">オファー提出</CardTitle>
                  <p className="mt-1 text-sm text-slate-600">
                    オファーが正常に提出されました。進捗に応じてタレントへ連絡を行いましょう。
                  </p>
                </div>
                <Badge className={cn('self-start', statusClassName)}>{statusLabel}</Badge>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <div className="space-y-1">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">提出日時</dt>
                    <dd className="text-base font-semibold text-slate-900">{formattedSubmittedAt}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">提出者</dt>
                    <dd className="text-sm font-medium text-slate-900">{offer.storeName || '未設定'}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">オファー金額</dt>
                    <dd className="text-base font-semibold text-slate-900">
                      {offer.reward != null ? `¥${offer.reward.toLocaleString('ja-JP')}` : '未設定'}
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">ステータス</dt>
                    <dd>
                      <Badge className={cn('mt-1', statusClassName)}>{statusLabel}</Badge>
                    </dd>
                  </div>
                </dl>
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  このオファーに関する詳細についてお気軽にメッセージをお送りください。
                </div>
                <CancelOfferSection
                  offerId={offer.id}
                  initialStatus={data.status}
                  initialCanceledAt={data.canceled_at}
                />
              </CardContent>
            </Card>
          </div>

          <aside className="flex h-full flex-col" id="chat">
            <OfferChatThread
              offerId={offer.id}
              currentUserId={user.id}
              currentRole="store"
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

function getStatusLabel(status: string) {
  switch (status) {
    case 'accepted':
    case 'confirmed':
      return '承認済み'
    case 'completed':
      return '完了'
    case 'rejected':
      return '辞退済み'
    case 'canceled':
      return 'キャンセル'
    case 'draft':
      return '下書き'
    default:
      return '承認待ち'
  }
}

function getStatusBadgeClassName(status: string) {
  switch (status) {
    case 'completed':
    case 'confirmed':
    case 'accepted':
      return 'bg-emerald-500 text-white'
    case 'draft':
      return 'bg-slate-200 text-slate-700'
    case 'rejected':
    case 'canceled':
      return 'bg-slate-300 text-slate-700'
    default:
      return 'bg-orange-400 text-white'
  }
}
