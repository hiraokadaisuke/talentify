export type StoreContract = {
  offer_id: string
  talent_name: string
  performance_date: string
  amount: number | null
  pdf_url: string | null
}

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserWithClient } from '@/lib/auth/getCurrentUserWithClient'

export async function getContractsForStore(): Promise<StoreContract[]> {
  const supabase = createClient()
  const { user } = await getCurrentUserWithClient(supabase)
  if (!user) return []

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!store) return []

  const { data: offers } = await supabase
    .from('offers')
    .select('id, talent_id, date, contract_url')
    .eq('store_id', store.id)

  if (!offers) return []

  const results: StoreContract[] = []

  for (const offer of offers) {
    const { data: talent } = await supabase
      .from('talents')
      .select('stage_name')
      .eq('id', offer.talent_id)
      .maybeSingle()

    const { data: payment } = await supabase
      .from('payments')
      .select('amount')
      .eq('offer_id', offer.id)
      .maybeSingle()

    const url = offer.contract_url ?? null

    results.push({
      offer_id: offer.id,
      talent_name: talent?.stage_name || '',
      performance_date: offer.date,
      amount: payment?.amount ?? null,
      pdf_url: url,
    })
  }

  return results
}
