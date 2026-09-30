import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { emitNotification } from '@/lib/notifications/emit'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient()
    const service = createServiceClient()
    const { user, error: userError } = await getCurrentUser()
    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = params
    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('id,offer_id,store_id,talent_id,status,invoice_number,amount')
      .eq('id', id)
      .single()

    if (invError || !invoice) {
      return NextResponse.json({ error: '見積書が見つかりません' }, { status: 404 })
    }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (
      storeError ||
      !store ||
      invoice.status !== 'submitted' ||
      store.id !== invoice.store_id
    ) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const now = new Date().toISOString()
    let invoiceNumber = invoice.invoice_number
    if (!invoiceNumber) {
      const { data: generated, error: numberError } = await service.rpc('next_invoice_number')
      if (numberError || !generated) throw numberError ?? new Error('invoice number generation failed')
      invoiceNumber = generated
    }

    const { data: contracted, error: updateError } = await service
      .from('invoices')
      .update({
        status: 'approved',
        contracted_at: now,
        invoice_number: invoiceNumber,
      })
      .eq('id', id)
      .eq('status', 'submitted')
      .select('id,offer_id,status,estimate_number,invoice_number,contracted_at,amount')
      .single()
    if (updateError) throw updateError

    if (invoice.offer_id) {
      const { error: offerError } = await service
        .from('offers')
        .update({
          status: 'confirmed',
          accepted_at: now,
          invoice_amount: invoice.amount,
          invoice_date: now,
          invoice_submitted: true,
        })
        .eq('id', invoice.offer_id)
        .eq('status', 'pending')
      if (offerError) throw offerError
    }

    try {
      const { data: talent } = await service
        .from('talents')
        .select('user_id')
        .eq('id', invoice.talent_id)
        .single()
      if (talent?.user_id) {
        await emitNotification({
          recipientUserId: talent.user_id,
          event: {
            kind: 'estimate_approved_to_talent',
            invoiceId: id,
            actorName: '店舗',
            actorId: user.id,
          },
          recipientRole: 'talent',
        })
      }
    } catch (notificationError) {
      console.error('failed to send contract notification', notificationError)
    }

    return NextResponse.json(contracted, { status: 200 })
  } catch (e) {
    console.error('[POST /invoices/:id/approve]', e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
