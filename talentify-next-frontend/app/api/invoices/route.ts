import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getSubmitStatus } from './utils'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const service = createServiceClient()
  let offerId: string | undefined

  try {
    const { user, error: userError } = await getCurrentUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { data: talent, error: talentError } = await supabase
      .from('talents')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (talentError || !talent) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      offer_id,
      amount,
      notes,
      transport_fee,
      extra_fee,
      invoice_url,
    } = body
    offerId = offer_id

    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('store_id, talent_id')
      .eq('id', offer_id)
      .single()
    if (offerError || !offer) {
      return NextResponse.json({ error: 'offer_not_found' }, { status: 404 })
    }
    if (talent.id !== offer.talent_id) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const { data: existing, error: existingError } = await supabase
      .from('invoices')
      .select('id,status')
      .eq('offer_id', offer_id)
      .maybeSingle()
    if (existingError) throw existingError

    const payload = {
      offer_id,
      store_id: offer.store_id,
      talent_id: offer.talent_id,
      amount,
      status: 'draft' as const,
      notes,
      transport_fee,
      extra_fee,
      invoice_url,
    }

    if (existing) {
      if (existing.status !== 'draft') {
        return NextResponse.json(
          { error: 'invoice_not_editable', status: existing.status },
          { status: 409 },
        )
      }

      const updatePayload = {
        offer_id,
        store_id: offer.store_id,
        talent_id: offer.talent_id,
        amount,
        notes,
        transport_fee,
        extra_fee,
        invoice_url,
      }
      const { data: updated, error: updateError } = await service
        .from('invoices')
        .update(updatePayload)
        .eq('id', existing.id)
        .select('id, status, invoice_number')
        .single()
      if (updateError) throw updateError
      await service
        .from('offers')
        .update({ invoice_amount: null, invoice_date: null, paid: null, paid_at: null })
        .eq('id', offer_id)
      return NextResponse.json({ id: updated.id, status: updated.status, invoice_number: updated.invoice_number }, { status: 200 })
    }

    const { data: inserted, error: insertError } = await service
      .from('invoices')
      .insert(payload)
      .select('id, status, invoice_number')
      .single()
    if (insertError) throw insertError

    await service
      .from('offers')
      .update({ invoice_amount: null, invoice_date: null, paid: null, paid_at: null })
      .eq('id', offer_id)

    return NextResponse.json({ id: inserted.id, status: inserted.status, invoice_number: inserted.invoice_number }, { status: 201 })
  } catch (err: any) {
    console.error({ code: err.code, message: err.message })
    if (err.code === '23505' && offerId) {
      const { data: existing } = await supabase
        .from('invoices')
        .select('id')
        .eq('offer_id', offerId)
        .single()
      if (existing) {
        return NextResponse.json({ error: 'duplicate', id: existing.id }, { status: 200 })
      }
    }
    if (err.code === '23502') {
      return NextResponse.json({ error: 'not_null_violation' }, { status: 400 })
    }
    if (err.code === '42501') {
      return NextResponse.json({ error: 'forbidden_rls' }, { status: 403 })
    }
    return NextResponse.json({ error: 'unknown', code: err.code }, { status: 400 })
  }
}
