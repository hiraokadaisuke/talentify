import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getOfferProgress } from '@/utils/offerProgress'
import StoreOfferProgressPanel from './StoreOfferProgressPanel'
import { deriveActiveStep } from '@/lib/offers/deriveActiveStep'
import {
  deriveOfferInvoiceProgressStatus,
  getInvoiceStatusLabel,
  getPaymentStatusLabel,
} from '@/lib/invoices/status'
import MessageCard from './MessageCard'

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
      `
      id,status,date,respond_deadline,reward,created_at,updated_at,message,talent_id,user_id,canceled_at,accepted_at,paid,paid_at,
      reviews(id), talents(stage_name,avatar_url,user_id),
      store:stores!offers_store_id_fkey(id, store_name, user_id)
    `
    )
    .eq('id', params.id)
    .single()

  if (!data || !user) {
    notFound()
  }

  const reviewCompleted = Array.isArray((data as any).reviews) && (data as any).reviews.length > 0

  const { data: invoice } = await supabase
    .from('invoices')
    .select('id,amount,invoice_url,status,payment_status')
    .eq('offer_id', params.id)
    .maybeSingle()

  const invoiceStatus = deriveOfferInvoiceProgressStatus({
    invoiceStatus: invoice?.status,
    invoicePaymentStatus: invoice?.payment_status,
    offerPaid: data.paid,
  })
  const invoiceStatusLabel = getInvoiceStatusLabel(invoice?.status)
  const paymentStatusLabel = getPaymentStatusLabel(invoice?.payment_status, data.paid)

  const offer = {
    id: data.id as string,
    status: data.status as string,
    date: data.date as string,
    respondDeadline: data.respond_deadline as string | null,
    submittedAt: data.created_at as string | null,
    message: data.message as string,
    performerName: data.talents?.stage_name || '',
    performerAvatarUrl: data.talents?.avatar_url || null,
    acceptedAt: data.accepted_at as string | null,
    storeName: data.store?.store_name || '',
    updatedAt: data.updated_at as string,
    paid: data.paid as boolean,
    paidAt: data.paid_at as string | null,
    invoiceStatus,
    invoiceStatusLabel,
    paymentStatusLabel,
    reward: data.reward as number | null,
    talentId: data.talent_id as string | null,
    reviewCompleted,
    talentUserId: data.talents?.user_id as string | null,
  }

  const invoiceData = invoice
    ? {
        id: invoice.id as string,
        invoiceUrl: invoice.invoice_url as string | null,
        amount: invoice.amount as number | null,
        status: invoice.status as string,
        paymentStatus: (invoice.payment_status as string | null) ?? null,
      }
    : null

  const showActions = ['accepted', 'confirmed', 'completed'].includes(data.status as string)
  const paymentLink = showActions && invoice ? `/store/invoices/${invoice.id}` : undefined

  const { steps } = getOfferProgress({
    status: offer.status,
    invoiceStatus: offer.invoiceStatus,
    paid: offer.paid,
    reviewCompleted: offer.reviewCompleted,
  })

  const activeStep = deriveActiveStep({
    status: offer.status,
    acceptedAt: offer.acceptedAt,
    visitScheduledAt: offer.date,
    invoiceStatus: offer.invoiceStatus,
    paid: offer.paid,
    paidAt: offer.paidAt,
  })

  const formattedUpdatedAt = format(new Date(offer.updatedAt), 'yyyy/MM/dd HH:mm', { locale: ja })

  const statusLabel = getStatusLabel(offer.status)
  const statusClassName = getStatusBadgeClassName(offer.status)

  return (
    <div className="bg-slate-50 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-3 lg:items-start">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">オファー詳細</h1>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{offer.performerName || 'タレント未設定'}</span>
                  <span className="text-slate-300">/</span>
                  <span>{offer.storeName || '店舗未設定'}</span>
                </div>
                <Badge className={cn('flex items-center gap-1', statusClassName)}>{statusLabel}</Badge>
              </div>
            </div>
              <div className="text-xs text-slate-500 md:text-right">
                <div className="font-medium text-slate-400">最終更新日時</div>
                <div>{formattedUpdatedAt}</div>
              </div>
          </div>
          </section>

          <StoreOfferProgressPanel
            steps={steps}
            initialActiveStep={activeStep}
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
              invoiceStatusLabel: offer.invoiceStatusLabel,
              paymentStatusLabel: offer.paymentStatusLabel,
              storeName: offer.storeName,
              reward: offer.reward,
              talentId: offer.talentId,
              reviewCompleted: offer.reviewCompleted,
            }}
            invoice={invoiceData}
            paymentLink={paymentLink}
            cancelation={{ initialStatus: data.status as string, initialCanceledAt: data.canceled_at as string | null }}
          />
        </div>
        <div className="lg:sticky lg:top-6">
          <MessageCard
            offerId={offer.id}
            currentUserId={user.id}
            peerUserId={offer.talentUserId ?? ''}
            storeName={offer.storeName}
            talentName={offer.performerName}
          />
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
