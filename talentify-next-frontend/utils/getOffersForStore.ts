'use client'

import { getCurrentUserWithClient } from '@/lib/auth/getCurrentUserWithClient'
import { deriveOfferInvoiceProgressStatus } from '@/lib/invoices/status'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export type Offer = {
  id: string
  user_id: string
  store_id: string
  talent_id: string
  talent_name: string | null
  created_at: string | null
  updated_at: string | null
  date: string | null
  status: string | null
  paid?: boolean | null
  paid_at?: string | null
  invoice_status: 'not_submitted' | 'submitted' | 'paid'
  review_completed: boolean
}

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

export async function getOffersForStore() {
  const { user } = await getCurrentUserWithClient(supabase)
  if (!user) return [] as Offer[]

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (storeError) {
    console.error('failed to fetch store for offers:', storeError)
    throw storeError
  }
  if (!store) return [] as Offer[]

  const { data, error } = await supabase
    .from('offers')
    .select(
      'id,user_id,store_id,talent_id,date,created_at,updated_at,status,paid,paid_at,talents(stage_name),reviews(id)'
    )
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('failed to fetch offers:', error)
    throw error
  }

  const offers = (data ?? []) as unknown as RawOffer[]

  let invoiceMap = new Map<string, { status: string | null; payment_status: string | null }>()
  if (offers.length > 0) {
    const { data: invoices, error: invoiceError } = await supabase
      .from('invoices')
      .select('offer_id,status,payment_status')
      .in(
        'offer_id',
        offers.map(o => o.id)
      )

    if (invoiceError) {
      console.error('failed to fetch invoices for store offers:', invoiceError)
    } else if (Array.isArray(invoices)) {
      invoiceMap = new Map(invoices.map(invoice => [invoice.offer_id, invoice]))
    }
  }

  return offers.map(o => {
    const invoice = invoiceMap.get(o.id)
    const invoiceStatus = deriveOfferInvoiceProgressStatus({
      invoiceStatus: invoice?.status,
      invoicePaymentStatus: invoice?.payment_status,
      offerPaid: o.paid,
    })

    const reviews = Array.isArray(o.reviews) ? o.reviews : []

    return {
      id: o.id,
      user_id: o.user_id,
      store_id: o.store_id,
      talent_id: o.talent_id,
      talent_name: o.talents?.stage_name ?? null,
      created_at: o.created_at,
      updated_at: o.updated_at,
      date: o.date,
      status: o.status,
      paid: o.paid,
      paid_at: o.paid_at,
      invoice_status: invoiceStatus,
      review_completed: reviews.length > 0,
    }
  }) as Offer[]
}
