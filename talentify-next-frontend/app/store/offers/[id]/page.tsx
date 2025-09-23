import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OfferChatThread from '@/components/offer/OfferChatThread'
import OfferSummary from '@/components/offer/OfferSummary'
import CancelOfferSection from './CancelOfferSection'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
      'id,status,date,created_at,updated_at,message,talent_id,user_id,canceled_at,paid,paid_at, talents(stage_name,avatar_url), stores(store_name)'
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
    submittedAt: data.created_at as string | null,
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">進捗状況</h2>
              <p className="mt-1 text-sm text-muted-foreground">
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
