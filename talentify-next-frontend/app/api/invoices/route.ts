import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

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

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
    }

    const {
      offer_id,
      amount,
      notes,
      transport_fee,
      extra_fee,
      invoice_url,
      due_date,
    } = body as Record<string, any>
    offerId = offer_id

    if (!offer_id || !Number.isFinite(Number(amount)) || Number(amount) < 0) {
      return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
    }

    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('store_id,talent_id,status')
      .eq('id', offer_id)
      .single()
    if (offerError || !offer) {
      return NextResponse.json({ error: 'offer_not_found' }, { status: 404 })
    }
    if (talent.id !== offer.talent_id) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }
    if (['rejected', 'canceled', 'completed'].includes(offer.status ?? '')) {
      return NextResponse.json({ error: 'offer_not_editable' }, { status: 409 })
    }

    const { data: existing, error: existingError } = await supabase
      .from('invoices')
      .select('id,status')
      .eq('offer_id', offer_id)
      .maybeSingle()
    if (existingError) throw existingError

    const documentPayload = {
      offer_id,
      store_id: offer.store_id,
      talent_id: offer.talent_id,
      amount: Number(amount),
      notes: notes ?? null,
      transport_fee: transport_fee == null ? null : Number(transport_fee),
      extra_fee: extra_fee == null ? null : Number(extra_fee),
      invoice_url: invoice_url ?? null,
      due_date: due_date || null,
    }

    if (existing) {
      if (!['draft', 'rejected'].includes(existing.status ?? '')) {
        return NextResponse.json(
          { error: 'estimate_locked', id: existing.id },
          { status: 409 },
        )
      }

      const { data: updated, error: updateError } = await service
        .from('invoices')
        .update({ ...documentPayload, status: 'draft' })
        .eq('id', existing.id)
        .select('id,status,estimate_number,invoice_number')
        .single()
      if (updateError) throw updateError

      return NextResponse.json(updated, { status: 200 })
    }

    const { data: inserted, error: insertError } = await service
      .from('invoices')
      .insert({ ...documentPayload, status: 'draft' })
      .select('id,status,estimate_number,invoice_number')
      .single()
    if (insertError) throw insertError

    return NextResponse.json(inserted, { status: 201 })
  } catch (err: any) {
    console.error('[POST /api/invoices]', { code: err?.code, message: err?.message })
    if (err?.code === '23505' && offerId) {
      const { data: existing } = await supabase
        .from('invoices')
        .select('id')
        .eq('offer_id', offerId)
        .maybeSingle()
      if (existing) {
        return NextResponse.json({ error: 'duplicate', id: existing.id }, { status: 409 })
      }
    }
    if (err?.code === '42501') {
      return NextResponse.json({ error: 'forbidden_rls' }, { status: 403 })
    }
    return NextResponse.json({ error: 'unknown', code: err?.code ?? null }, { status: 400 })
  }
}
