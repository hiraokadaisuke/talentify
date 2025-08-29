'use client'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase'

const supabase = createClient()

export type Invoice = Database['public']['Tables']['invoices']['Row'] & {
  offers: { paid: boolean | null } | null
}

type RawInvoice = Database['public']['Tables']['invoices']['Row'] & {
  offers: { paid: boolean | null }[] | null
}

export async function getInvoicesForStore() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return [] as Invoice[]

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!store) return [] as Invoice[]

  const { data, error } = await supabase
    .from('invoices')
    .select('*, offers(paid)')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('failed to fetch invoices', error)
    return [] as Invoice[]
  }
  const raw = (data ?? []) as unknown as RawInvoice[]
  return raw.map(inv => ({
    ...inv,
    offers: Array.isArray(inv.offers) ? inv.offers[0] ?? null : inv.offers,
  })) as Invoice[]
}
