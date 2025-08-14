import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  let json: any
  try {
    json = await req.json()
  } catch (e) {
    return NextResponse.json(
      { error: 'invalid json body' },
      { status: 400 }
    )
  }

  const { id, offer_id, paid_at } = json

  try {
    let paymentId = id as string | undefined

    if (!paymentId && offer_id) {
      const { data, error } = await supabase
        .from('payments')
        .select('id')
        .eq('offer_id', offer_id)

      if (error) {
        console.error('[POST /payments/complete] select by offer_id', error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      if (!data || data.length === 0) {
        return NextResponse.json({ error: 'payment not found' }, { status: 400 })
      }

      if (data.length > 1) {
        return NextResponse.json({ error: 'multiple payments found' }, { status: 400 })
      }

      paymentId = data[0].id
    }

    if (!paymentId) {
      return NextResponse.json({ error: 'missing payment id' }, { status: 400 })
    }

    const updateRes = await supabase
      .from('payments')
      .update({
        status: 'completed',
        paid_at: paid_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)

    if (updateRes.error) {
      const status = updateRes.error.code === '42501' ? 403 : 400
      console.error('[POST /payments/complete] update failed', updateRes.error)
      return NextResponse.json(
        { error: updateRes.error.message },
        { status }
      )
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e: any) {
    console.error('[POST /payments/complete]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
