import TalentInvoicesClient from './InvoicesClient'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserWithClient } from '@/lib/auth/getCurrentUserWithClient'
import type { Invoice } from '@/utils/getInvoicesForTalent'

async function loadInitialInvoices(): Promise<{
  invoices: Invoice[]
  loadError: boolean
}> {
  const supabase = createClient()

  try {
    const { user } = await getCurrentUserWithClient(supabase)
    if (!user) return { invoices: [], loadError: false }

    const { data: talent, error: talentError } = await supabase
      .from('talents')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (talentError) throw talentError
    if (!talent) return { invoices: [], loadError: false }

    const { data, error } = await supabase
      .from('invoices')
      .select(
        'id,amount,transport_fee,extra_fee,notes,invoice_number,due_date,status,payment_status,created_at'
      )
      .eq('talent_id', talent.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      invoices: (data ?? []) as Invoice[],
      loadError: false,
    }
  } catch (error) {
    console.error('failed to preload talent invoices', error)
    return { invoices: [], loadError: true }
  }
}

export default async function TalentInvoicesPage() {
  const { invoices, loadError } = await loadInitialInvoices()
  return (
    <TalentInvoicesClient
      initialInvoices={invoices}
      initialLoadError={loadError}
    />
  )
}
