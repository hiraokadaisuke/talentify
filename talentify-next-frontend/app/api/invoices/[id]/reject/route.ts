import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { user, error: userError } = await getCurrentUser()
    if (userError || !user) {
      return NextResponse.json<{ error: string }>({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = params
    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('store_id, talent_id, status')
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
      invoice.status !== 'submitted' ||
      store.id !== invoice.store_id
    ) {
      return NextResponse.json<{ error: string }>({ error: '権限がありません' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('invoices')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

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
          type: 'invoice_submitted',
          title: '請求書が差し戻されました',
          body: '修正内容を確認し、再提出をお願いします。',
          priority: 'high',
          action_url: `/talent/invoices`,
          action_label: '再提出する',
          entity_type: 'invoice',
          entity_id: id,
          actor_name: '店舗',
          data: { invoice_id: id },
        })
      }
    } catch (e) {
      console.error('failed to send notification', e)
    }

    return NextResponse.json(data, { status: 200 })
  } catch (e) {
    console.error('[POST /invoices/:id/reject]', e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
