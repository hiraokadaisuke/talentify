import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createClient()
  const { user, error: userError } = await getCurrentUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const [{ data: store }, { data: offer, error: offerError }] = await Promise.all([
    supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('offers')
      .select('id,store_id,status,date')
      .eq('id', params.id)
      .maybeSingle(),
  ])

  if (!store || offerError || !offer) {
    return NextResponse.json({ error: 'offer_not_found' }, { status: 404 })
  }

  if (offer.store_id !== store.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  if (offer.status === 'completed') {
    return NextResponse.json({ ok: true, alreadyCompleted: true })
  }

  if (offer.status !== 'confirmed') {
    return NextResponse.json(
      {
        error: 'invalid_offer_state',
        message: '締結済みの案件だけ来店完了にできます',
      },
      { status: 409 },
    )
  }

  const scheduledAt = new Date(offer.date)
  if (!Number.isNaN(scheduledAt.getTime()) && scheduledAt.getTime() > Date.now()) {
    return NextResponse.json(
      {
        error: 'visit_not_started',
        message: '来店予定日時より前には完了にできません',
      },
      { status: 409 },
    )
  }

  const now = new Date().toISOString()
  const service = createServiceClient()
  const db = service as any
  const { data: updated, error } = await db
    .from('offers')
    .update({
      status: 'completed',
      visit_completed_at: now,
      updated_at: now,
    })
    .eq('id', offer.id)
    .eq('status', 'confirmed')
    .select('id')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!updated) {
    return NextResponse.json(
      {
        error: 'offer_state_changed',
        message: '案件の状態が変更されています。画面を更新してください',
      },
      { status: 409 },
    )
  }

  return NextResponse.json({ ok: true, visit_completed_at: now })
}
