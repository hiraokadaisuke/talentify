'use client'

import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export type Offer = {
  id: string
  user_id: string
  store_id: string
  talent_id: string
  talent_name: string | null
  created_at: string | null
  date: string | null
  status: string | null
  paid?: boolean | null
  paid_at?: string | null
  payment_id?: string | null
  invoice_status: 'not_submitted' | 'submitted' | 'paid'
  review_completed: boolean
}

export async function getOffersForStore() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return [] as Offer[]

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!store) return [] as Offer[]

  const { data, error } = await supabase
    .from('offers')
    .select(
      'id,user_id,store_id,talent_id,date,created_at,status,payments(id,status,paid_at),talents(stage_name),reviews(id)'
    )
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('failed to fetch offers:', error)
    return [] as Offer[]
  }

  const offers = (data ?? []) as any[]

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
    const payment = Array.isArray(o.payments) ? o.payments[0] : o.payments
    const paymentStatus = payment?.status ?? null
    const invoice = invoiceMap.get(o.id)
    const invoiceStatus: 'not_submitted' | 'submitted' | 'paid' = invoice
      ? paymentStatus === 'completed' || invoice.payment_status === 'paid'
        ? 'paid'
        : 'submitted'
      : 'not_submitted'

    const reviews = Array.isArray(o.reviews) ? o.reviews : []

    return {
      id: o.id,
      user_id: o.user_id,
      store_id: o.store_id,
      talent_id: o.talent_id,
      talent_name: o.talents?.stage_name ?? null,
      created_at: o.created_at,
      date: o.date,
      status: o.status,
      paid: paymentStatus === 'completed',
      paid_at: payment?.paid_at ?? null,
      payment_id: payment?.id ?? null,
      invoice_status: invoiceStatus,
      review_completed: reviews.length > 0,
    }
  }) as Offer[]
}
