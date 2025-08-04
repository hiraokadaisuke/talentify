'use client'

import { createClient } from '@/utils/supabase/client'

export type CompanyOffer = {
  id: string
  talent_name: string | null
  store_name: string | null
  status: string | null
  date: string | null
  reward: number | null
  invoice_amount: number | null
  invoice_date: string | null
  agreed: boolean | null
  invoice_submitted: boolean | null
  paid: boolean | null
  paid_at: string | null
}

const supabase = createClient()

export async function getOffersForCompany(): Promise<CompanyOffer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select(
      'id, status, date, reward, invoice_amount, invoice_date, agreed, invoice_submitted, paid, paid_at, talents(stage_name), stores(store_name)'
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('failed to fetch offers for company:', error)
    return []
  }

  return (data || []).map((o: any) => ({
    id: o.id,
    status: o.status,
    date: o.date,
    reward: o.reward,
    invoice_amount: o.invoice_amount,
    invoice_date: o.invoice_date,
    agreed: o.agreed,
    invoice_submitted: o.invoice_submitted,
    paid: o.paid,
    paid_at: o.paid_at,
    talent_name: o.talents?.stage_name ?? null,
    store_name: o.stores?.store_name ?? null,
  }))
}
