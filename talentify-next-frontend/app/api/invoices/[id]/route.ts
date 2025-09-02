import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json<{ error: string }>({ error: '認証が必要です' }, { status: 401 })
    }
    const { id } = params
    const body = await req.json()

    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('store_id, talent_id, status')
      .eq('id', id)
      .single()
    if (invError || !invoice) {
      return NextResponse.json<{ error: string }>({ error: '請求書が見つかりません' }, { status: 404 })
    }
    if (invoice.status !== 'draft') {
      return NextResponse.json<{ error: string }>({ error: '下書きのみ編集できます' }, { status: 400 })
    }

    const { data: talent, error: talentError } = await supabase
      .from('talents')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (talentError || !talent || talent.id !== invoice.talent_id) {
      return NextResponse.json<{ error: string }>({ error: '権限がありません' }, { status: 403 })
    }

    const allowedFields = ['invoice_url', 'amount', 'due_date']
    const updates: Record<string, any> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field]
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json<{ error: string }>({ error: '更新可能な項目がありません' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    return NextResponse.json(data, { status: 200 })
  } catch (e) {
    console.error('[PATCH /invoices/:id]', e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
