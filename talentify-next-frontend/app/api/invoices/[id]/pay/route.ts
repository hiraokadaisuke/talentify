import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient()
  const { id } = params

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json<{ error: string }>({ error: '認証が必要です' }, { status: 401 })
    }

    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('store_id, talent_id, status, offer_id')
      .eq('id', id)
      .single()
    if (invError || !invoice) {
      return NextResponse.json<{ error: string }>({ error: '請求書が見つかりません' }, { status: 404 })
    }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (
      storeError ||
      !store ||
      invoice.status !== 'approved' ||
      store.id !== invoice.store_id
    ) {
      return NextResponse.json<{ error: string }>({ error: '権限がありません' }, { status: 403 })
    }

    const { paid_at } = await req.json().catch(() => ({}))
    const paidTime = paid_at ?? new Date().toISOString()

    const { error: invoiceError } = await supabase
      .from('invoices')
      .update({ payment_status: 'paid', paid_at: paidTime })
      .eq('id', id)
    if (invoiceError) throw invoiceError

    const { error: offerError } = await supabase
      .from('offers')
      .update({ paid: true, paid_at: paidTime })
      .eq('id', invoice.offer_id)
    if (offerError) throw offerError

    try {
      const service = createServiceClient()
      const { data: talent } = await service
        .from('talents')
        .select('user_id')
        .eq('id', invoice.talent_id)
        .single()
      if (talent?.user_id) {
        await service.from('notifications').insert({
          user_id: talent.user_id,
          type: 'payment_created',
          title: '支払いが記録されました',
          data: { invoice_id: id },
        })
      }
    } catch (e) {
      console.error('failed to send notification', e)
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err: any) {
    console.error({ code: err.code, message: err.message })
    if (err.code === '23502') {
      return NextResponse.json<{ error: string }>({ error: '必要な列が不足しています' }, { status: 400 })
    }
    if (err.code === '42501') {
      return NextResponse.json<{ error: string }>({ error: '権限がありません' }, { status: 403 })
    }
    return NextResponse.json<{ error: string }>({ error: '不明なエラー' }, { status: 400 })
  }
}

