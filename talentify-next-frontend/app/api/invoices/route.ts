import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json<{ error: string }>({ error: '認証が必要です' }, { status: 401 })
    }
    const body = await req.json()
    const { offer_id, amount, invoice_url } = body

    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('store_id, talent_id')
      .eq('id', offer_id)
      .single()
    if (offerError || !offer) {
      return NextResponse.json<{ error: string }>({ error: 'オファーが見つかりません' }, { status: 404 })
    }
    if (user.id !== offer.talent_id) {
      return NextResponse.json<{ error: string }>({ error: '権限がありません' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        offer_id,
        store_id: offer.store_id,
        talent_id: offer.talent_id,
        amount,
        invoice_url,
        status: 'pending',
      })
      .select()
      .single()
    if (error) throw error

    return NextResponse.json(data, { status: 200 })
  } catch (e) {
    console.error('[POST /invoices]', e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
