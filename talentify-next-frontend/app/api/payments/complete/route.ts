import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { offer_id } = await req.json()
    if (!offer_id) {
      return NextResponse.json({ error: 'offer_id is required' }, { status: 400 })
    }

    let { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('offer_id', offer_id)
      .maybeSingle()

    if (!payment) {
      const insertRes = await supabase
        .from('payments')
        .insert({ offer_id, status: 'pending' })
        .select()
        .single()
      if (insertRes.error) throw insertRes.error
      payment = insertRes.data
    }

    if (payment.status === 'completed') {
      return NextResponse.json(payment, { status: 200 })
    }

    const updateRes = await supabase
      .from('payments')
      .update({ status: 'completed', paid_at: new Date().toISOString() })
      .eq('id', payment.id)
      .select()
      .single()
    if (updateRes.error) throw updateRes.error

    return NextResponse.json(updateRes.data, { status: 200 })
  } catch (e) {
    console.error('[POST /payments/complete]', e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
