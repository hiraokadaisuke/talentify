'use client'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase'
import { getTalentId } from './getTalentId'

const supabase = createClient()

export type Invoice = Database['public']['Tables']['invoices']['Row']

export async function getInvoicesForTalent() {
  const talentId = await getTalentId()
  if (!talentId) return [] as Invoice[]

  const { data, error } = await supabase
    .from('invoices')
    .select(
      'id,amount,transport_fee,extra_fee,notes,invoice_number,due_date,status,payment_status,created_at'
    )
    .eq('talent_id', talentId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('failed to fetch invoices', error)
    return []
  }
  return (data ?? []) as Invoice[]
}
