import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OfferChatThread from '@/components/offer/OfferChatThread'
import OfferSummary from '@/components/offer/OfferSummary'
import OfferPaymentStatusCard from '@/components/offer/OfferPaymentStatusCard'
import CancelOfferSection from './CancelOfferSection'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full p-4">
      <div className="flex flex-col gap-4 w-full lg:w-1/3">
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
            <div className="mt-4">
              <CancelOfferSection
                offerId={offer.id}
                initialStatus={data.status}
                initialCanceledAt={data.canceled_at}
              />
            </div>
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
      <div className="flex flex-col flex-1 gap-4 w-full lg:w-2/3">
        <div className="flex items-center justify-between p-4 bg-white rounded shadow">
          <div className="flex items-center gap-2">
            {renderStatusBadge()}
            <span className="text-sm text-muted-foreground">
              最終更新: {formattedUpdatedAt}
            </span>
          </div>
        </div>
        <div id="chat" className="flex-1 min-h-0">
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
