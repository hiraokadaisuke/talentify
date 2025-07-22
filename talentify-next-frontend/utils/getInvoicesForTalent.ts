'use client'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase'

const supabase = createClient()

export type Invoice = Database['public']['Tables']['invoices']['Row']

export async function getInvoicesForTalent() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return [] as Invoice[]

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('talent_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('failed to fetch invoices', error)
    return []
  }
  return (data ?? []) as Invoice[]
}
