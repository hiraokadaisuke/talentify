import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { id } = params
  const {
    status,
    fixed_date,
    contract_url,
    agreed,
    invoice_date,
    invoice_amount,
    bank_name,
    bank_branch,
    bank_account_number,
    bank_account_holder,
    invoice_submitted,
    paid,
    paid_at,
  } = await req.json()

  const updates: Record<string, any> = {}
  if (status) updates.status = status
  if (fixed_date) updates.fixed_date = fixed_date
  if (contract_url) updates.contract_url = contract_url
  if (typeof agreed === 'boolean') updates.agreed = agreed
  if (invoice_date) updates.invoice_date = invoice_date
  if (invoice_amount) updates.invoice_amount = invoice_amount
  if (bank_name) updates.bank_name = bank_name
  if (bank_branch) updates.bank_branch = bank_branch
  if (bank_account_number) updates.bank_account_number = bank_account_number
  if (bank_account_holder) updates.bank_account_holder = bank_account_holder
  if (typeof invoice_submitted === 'boolean')
    updates.invoice_submitted = invoice_submitted
  if (typeof paid === 'boolean') {
    updates.paid = paid
    updates.paid_at = paid ? paid_at || new Date().toISOString() : null
  }

  const { error } = await supabase
    .from('offers')
    .update(updates)
    .eq('id', id)

  if (error) {
    return NextResponse.json<{ error: string }>({ error: error.message }, { status: 500 })
  }

  if (paid === true) {
    const { data: offerInfo } = await supabase
      .from('offers')
      .select('talent_id, invoice_amount')
      .eq('id', id)
      .single()
    if (offerInfo) {
      await supabase.from('notifications').insert({
        user_id: offerInfo.talent_id,
        type: 'payment_created',
        data: {
          offer_id: id,
          amount: offerInfo.invoice_amount,
          paid_at: updates.paid_at,
        },
      })
    }
  }

  // Notify performer or store about status change via webhook if configured
  const webhook = process.env.NOTIFICATION_WEBHOOK_URL
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId: id, status, contract_url, agreed }),
      })
    } catch (err) {
      console.error('Failed to send notification:', err)
    }
  }

  return NextResponse.json<{ message: string }>({ message: '更新しました' }, { status: 200 })
}
