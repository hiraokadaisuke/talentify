import TalentOffersClient from './OffersClient'
import { createClient } from '@/lib/supabase/server'
import { getProtectedRequestUserId } from '@/lib/auth/getProtectedRequestUserId'
import { deriveOfferInvoiceProgressStatus } from '@/lib/invoices/status'
import type { TalentOffer } from '@/utils/getOffersForTalent'

type RawOffer = {
  id: string
  store_id: string
  created_at: string | null
  updated_at: string | null
  date: string | null
  status: string | null
  paid: boolean | null
  paid_at: string | null
  reviews: { id: string }[] | null
  store: {
    id: string
    store_name: string | null
    is_setup_complete: boolean | null
  } | null
}

async function loadInitialOffers(): Promise<{
  offers: TalentOffer[]
  loadError: boolean
}> {
  const supabase = createClient()

  try {
    const { userId } = await getProtectedRequestUserId(supabase)
    if (!userId) return { offers: [], loadError: false }

    const { data: talent, error: talentError } = await supabase
      .from('talents')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (talentError) throw talentError
    if (!talent) return { offers: [], loadError: false }

    const { data, error } = await supabase
      .from('offers')
      .select(
        `
        id, store_id, created_at, updated_at, date, status, paid, paid_at, reviews(id),
        store:stores!offers_store_id_fkey(id, store_name, is_setup_complete)
        `
      )
      .eq('talent_id', talent.id)
      .or('and(status.eq.canceled,accepted_at.not.is.null),status.neq.canceled')
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
        console.error('failed to preload invoices for talent offers', invoiceError)
      } else if (Array.isArray(invoices)) {
        invoiceMap = new Map(invoices.map(invoice => [invoice.offer_id, invoice]))
      }
    }

    const offers = rawOffers.map(offer => {
      const invoice = invoiceMap.get(offer.id)
      const reviews = Array.isArray(offer.reviews) ? offer.reviews : []

      return {
        id: offer.id,
        store_id: offer.store_id,
        store_name: offer.store?.store_name ?? null,
        created_at: offer.created_at,
        updated_at: offer.updated_at,
        date: offer.date,
        status: offer.status,
        paid: offer.paid,
        invoice_status: deriveOfferInvoiceProgressStatus({
          invoiceStatus: invoice?.status,
          invoicePaymentStatus: invoice?.payment_status,
          offerPaid: offer.paid,
        }),
        review_completed: reviews.length > 0,
      }
    }) as TalentOffer[]

    return { offers, loadError: false }
  } catch (error) {
    console.error('failed to preload talent offers', error)
    return { offers: [], loadError: true }
  }
}

export default async function TalentOffersPage() {
  const { offers, loadError } = await loadInitialOffers()
  return (
    <TalentOffersClient
      initialOffers={offers}
      initialLoadError={loadError}
    />
  )
}
