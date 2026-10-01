import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createServiceClient } from '@/lib/supabase/service'
import { emitNotification } from '@/lib/notifications/emit'

const MIN_REASON_LENGTH = 5
const MAX_REASON_LENGTH = 500

function parseTokyoTimestamp(value: string | null | undefined) {
  if (!value) return null
  const normalized = value.replace(' ', 'T')
  const withOffset = /(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized)
    ? normalized
    : `${normalized}+09:00`
  const parsed = new Date(withOffset)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => null)
    const reason = typeof body?.reason === 'string' ? body.reason.trim() : ''

    if (reason.length < MIN_REASON_LENGTH || reason.length > MAX_REASON_LENGTH) {
      return NextResponse.json(
        { error: '来店なしの理由は5文字以上500文字以内で入力してください' },
        { status: 400 }
      )
    }

    const { user, error: userError } = await getCurrentUser()
    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const service = createServiceClient()
    const db = service as any
    const { data: offer, error: offerError } = await db
      .from('offers')
      .select('id,status,paid,visit_completed_at,end_time,store_id,talent_id')
      .eq('id', params.id)
      .maybeSingle()

    if (offerError || !offer) {
      return NextResponse.json({ error: 'オファーが見つかりません' }, { status: 404 })
    }

    const [{ data: store }, { data: talent }, { data: invoice }] = await Promise.all([
      db.from('stores').select('user_id').eq('id', offer.store_id).maybeSingle(),
      db.from('talents').select('user_id').eq('id', offer.talent_id).maybeSingle(),
      db.from('invoices').select('id,status,contract_snapshot').eq('offer_id', offer.id).maybeSingle(),
    ])

    if (!store || store.user_id !== user.id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }
    if (offer.status === 'no_show') {
      return NextResponse.json({ error: 'すでに来店なしとして記録されています' }, { status: 409 })
    }
    if (offer.status !== 'confirmed') {
      return NextResponse.json({ error: '締結済みの案件だけ来店なしとして記録できます' }, { status: 409 })
    }
    if (offer.paid || offer.visit_completed_at) {
      return NextResponse.json({ error: '来店完了後または支払い完了後の案件には記録できません' }, { status: 409 })
    }
    if (invoice?.status !== 'approved' || !invoice.contract_snapshot) {
      return NextResponse.json({ error: '締結書の状態を確認できないため記録できません' }, { status: 409 })
    }

    const scheduledEnd = parseTokyoTimestamp(offer.end_time)
    if (!scheduledEnd || scheduledEnd.getTime() > Date.now()) {
      return NextResponse.json({ error: '来店予定の終了時刻を過ぎてから記録してください' }, { status: 409 })
    }

    const now = new Date().toISOString()
    const { data: updated, error: updateError } = await db
      .from('offers')
      .update({
        status: 'no_show',
        no_show_at: now,
        no_show_reason: reason,
        no_show_reported_by_user_id: user.id,
        updated_at: now,
      })
      .eq('id', offer.id)
      .eq('status', 'confirmed')
      .select('id')
      .maybeSingle()

    if (updateError) {
      if (updateError.code === '23514') {
        return NextResponse.json(
          { error: '現在の状態では来店なしを記録できません。画面を更新してください' },
          { status: 409 }
        )
      }
      throw updateError
    }
    if (!updated) {
      return NextResponse.json({ error: '案件の状態が変更されています。画面を更新してください' }, { status: 409 })
    }

    if (talent?.user_id) {
      try {
        await emitNotification({
          recipientUserId: talent.user_id,
          recipientRole: 'talent',
          event: {
            kind: 'offer_updated',
            offerId: offer.id,
            actorId: user.id,
            actorName: '店舗',
            status: 'no_show',
            change: 'no_show',
            noShowReason: reason,
          },
        })
      } catch (notificationError) {
        console.error('failed to send no-show notification', notificationError)
      }
    }

    return NextResponse.json({
      ok: true,
      status: 'no_show',
      no_show_at: now,
      no_show_reason: reason,
      no_show_reported_by_user_id: user.id,
      invoice_id: invoice.id,
    })
  } catch (error) {
    console.error('[POST /offers/:id/no-show]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
