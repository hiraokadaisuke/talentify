export type StoreContract = {
  offer_id: string
  talent_name: string
  performance_date: string
  amount: number | null
  pdf_url: string | null
}

import { createClient } from '@/lib/supabase/server'

export async function getContractsForStore(): Promise<StoreContract[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: offers } = await supabase
    .from('offers')
    .select('id, talent_id, date')
    .eq('user_id', user.id)

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

    const { data } = supabase.storage
      .from('contracts')
      .getPublicUrl(`${offer.id}.pdf`)

    results.push({
      offer_id: offer.id,
      talent_name: talent?.stage_name || '',
      performance_date: offer.date,
      amount: payment?.amount ?? null,
      pdf_url: data.publicUrl || null,
    })
  }

  return results
}
