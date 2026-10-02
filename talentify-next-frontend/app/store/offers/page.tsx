import StoreOffersClient from './OffersClient'
import { createClient } from '@/lib/supabase/server'
import { getProtectedRequestUserId } from '@/lib/auth/getProtectedRequestUserId'
import { deriveOfferInvoiceProgressStatus } from '@/lib/invoices/status'
import type { Offer } from '@/utils/getOffersForStore'

type RawOffer = {
  id: string
  user_id: string
  store_id: string
  talent_id: string
  created_at: string | null
  updated_at: string | null
  date: string | null
  status: string | null
  paid: boolean | null
  paid_at: string | null
  talents: { stage_name: string | null } | null
  reviews: { id: string }[] | null
}

async function loadInitialOffers(): Promise<{
  offers: Offer[]
  loadError: boolean
}> {
  const supabase = createClient()

  try {
    const { userId } = await getProtectedRequestUserId(supabase)
    if (!userId) return { offers: [], loadError: false }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (storeError) throw storeError
    if (!store) return { offers: [], loadError: false }

    const { data, error } = await supabase
      .from('offers')
      .select(
        'id,user_id,store_id,talent_id,date,created_at,updated_at,status,paid,paid_at,talents(stage_name),reviews(id)'
      )
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const rawOffers = (data ?? []) as unknown as RawOffer[]
    let invoiceMap = new Map<string, { status: string | null; payment_status: string | null }>()

    if (rawOffers.length > 0) {
      const { data: invoices, error: invoiceError } = await supabase
        .from('invoices')
        .select('offer_id,status,payment_status')
        .in('offer_id', rawOffers.map(offer => offer.id))

      if (invoiceError) {
        console.error('failed to preload invoices for store offers', invoiceError)
      } else if (Array.isArray(invoices)) {
        invoiceMap = new Map(invoices.map(invoice => [invoice.offer_id, invoice]))
      }
    }

    const offers = rawOffers.map(offer => {
      const invoice = invoiceMap.get(offer.id)
      const reviews = Array.isArray(offer.reviews) ? offer.reviews : []

      return {
        id: offer.id,
        user_id: offer.user_id,
        store_id: offer.store_id,
        talent_id: offer.talent_id,
        talent_name: offer.talents?.stage_name ?? null,
        created_at: offer.created_at,
        updated_at: offer.updated_at,
        date: offer.date,
        status: offer.status,
        paid: offer.paid,
        paid_at: offer.paid_at,
        invoice_status: deriveOfferInvoiceProgressStatus({
          invoiceStatus: invoice?.status,
          invoicePaymentStatus: invoice?.payment_status,
          offerPaid: offer.paid,
        }),
        review_completed: reviews.length > 0,
      }
    }) as Offer[]

    return { offers, loadError: false }
  } catch (error) {
    console.error('failed to preload store offers', error)
    return { offers: [], loadError: true }
  }
}

export default async function StoreOffersPage() {
  const { offers, loadError } = await loadInitialOffers()
  return (
    <StoreOffersClient
      initialOffers={offers}
      initialLoadError={loadError}
    />
  )
}
