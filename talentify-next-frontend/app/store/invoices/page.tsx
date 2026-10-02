import StoreInvoicesClient from './InvoicesClient'
import { createClient } from '@/lib/supabase/server'
import { getProtectedRequestUserId } from '@/lib/auth/getProtectedRequestUserId'
import type { Database } from '@/types/supabase'
import type { Invoice } from '@/utils/getInvoicesForStore'

type RawInvoice = Database['public']['Tables']['invoices']['Row'] & {
  offers: { paid: boolean | null }[] | null
}

async function loadInitialInvoices(): Promise<{
  invoices: Invoice[]
  loadError: boolean
}> {
  const supabase = createClient()

  try {
    const { userId } = await getProtectedRequestUserId(supabase)
    if (!userId) return { invoices: [], loadError: false }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (storeError) throw storeError
    if (!store) return { invoices: [], loadError: false }

    const { data, error } = await supabase
      .from('invoices')
      .select('*, offers(paid)')
      .eq('store_id', store.id)
      .neq('status', 'draft')
      .order('created_at', { ascending: false })

    if (error) throw error

    const raw = (data ?? []) as unknown as RawInvoice[]
    const invoices = raw.map(inv => ({
      ...inv,
      offers: Array.isArray(inv.offers) ? inv.offers[0] ?? null : inv.offers,
    })) as Invoice[]

    return { invoices, loadError: false }
  } catch (error) {
    console.error('failed to preload store invoices', error)
    return { invoices: [], loadError: true }
  }
}

export default async function StoreInvoicesPage() {
  const { invoices, loadError } = await loadInitialInvoices()
  return (
    <StoreInvoicesClient
      initialInvoices={invoices}
      initialLoadError={loadError}
    />
  )
}
