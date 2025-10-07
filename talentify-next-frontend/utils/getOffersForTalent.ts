'use client'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/client'
import { getTalentId } from './getTalentId'

const supabase = createClient()

export type TalentOffer = {
  id: string
  store_id: string
  store_name: string | null
  created_at: string | null
  date: string | null
  status: string | null
  paid?: boolean | null
  invoice_status: 'not_submitted' | 'submitted' | 'paid'
}

const offerRowSchema = z.object({
  id: z.string(),
  store_id: z.string(),
  created_at: z.string().nullable(),
  date: z.string().nullable(),
  status: z.string().nullable(),
  payments: z
    .array(
      z.object({ status: z.string().nullable(), paid_at: z.string().nullable() })
    )
    .nullable(),
  store: z
    .object({
      id: z.string(),
      store_name: z.string().nullable(),
      is_setup_complete: z.boolean().nullable(),
    })
    .nullable(),
})

export async function getOffersForTalent() {
  const talentId = await getTalentId()
  if (!talentId) return [] as TalentOffer[]

  const { data, error } = await supabase
    .from('offers')
    .select(
      `
      id, store_id, created_at, date, status, payments(status,paid_at),
      store:stores!offers_store_id_fkey(id, store_name, is_setup_complete)
    `
    )
    .eq('talent_id', talentId)
    .or('and(status.eq.canceled,accepted_at.not.is.null),status.neq.canceled')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('failed to fetch offers for talent:', error)
    throw error
  }

  const parsed = offerRowSchema.array().safeParse(data ?? [])
  if (!parsed.success) {
    console.error('invalid data shape:', parsed.error)
    return [] as TalentOffer[]
  }

  let invoiceMap = new Map<string, { status: string | null; payment_status: string | null }>()

  if (parsed.data.length > 0) {
    const { data: invoices, error: invoiceError } = await supabase
      .from('invoices')
      .select('offer_id,status,payment_status')
      .in(
        'offer_id',
        parsed.data.map(o => o.id)
      )

    if (invoiceError) {
      console.error('failed to fetch invoices for offers:', invoiceError)
    } else if (Array.isArray(invoices)) {
      invoiceMap = new Map(invoices.map(invoice => [invoice.offer_id, invoice]))
    }
  }

  return parsed.data.map(o => {
    const paymentStatus = o.payments?.[0]?.status ?? null
    const invoice = invoiceMap.get(o.id)
    const invoiceStatus: 'not_submitted' | 'submitted' | 'paid' = invoice
      ? paymentStatus === 'completed' || invoice.payment_status === 'paid'
        ? 'paid'
        : 'submitted'
      : 'not_submitted'

    const storeName = o.store?.store_name ?? null

    return {
      id: o.id,
      store_id: o.store_id,
      store_name: storeName,
      created_at: o.created_at,
      date: o.date,
      status: o.status,
      paid: paymentStatus === 'completed',
      invoice_status: invoiceStatus,
    }
  }) as TalentOffer[]
}
