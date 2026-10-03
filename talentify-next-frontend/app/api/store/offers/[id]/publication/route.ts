import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type PublicationAction = 'publish' | 'hide'

function createSlug(date: string, offerId: string) {
  const dateKey = date.slice(0, 10)
  const shortId = offerId.replace(/-/g, '').slice(0, 10)
  return `${dateKey}-raiten-${shortId}`
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const { data: offer, error: offerError } = await supabase
    .from('offers')
    .select('id,status,date,store_id')
    .eq('id', params.id)
    .maybeSingle()

  if (offerError || !offer?.store_id) {
    return NextResponse.json({ error: '案件が見つかりません' }, { status: 404 })
  }

  const { data: ownedStore } = await supabase
    .from('stores')
    .select('id')
    .eq('id', offer.store_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!ownedStore) {
    return NextResponse.json({ error: 'この操作を行う権限がありません' }, { status: 403 })
  }

  let body: {
    action?: PublicationAction
    publishAt?: string | null
    showTime?: boolean
    publicNote?: string | null
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '入力内容を確認してください' }, { status: 400 })
  }

  const db = supabase as any
  const { data: existing } = await db
    .from('event_publications')
    .select('id,offer_id,slug,status,publish_at,published_at,show_time,public_note')
    .eq('offer_id', offer.id)
    .maybeSingle()

  if (body.action === 'hide') {
    if (!existing) {
      return NextResponse.json({ error: '公開情報がありません' }, { status: 404 })
    }

    const { data: publication, error } = await db
      .from('event_publications')
      .update({
        status: 'hidden',
        publish_at: null,
        published_at: null,
      })
      .eq('id', existing.id)
      .select('id,offer_id,slug,status,publish_at,published_at,show_time,public_note')
      .single()

    if (error) {
      console.error('Failed to hide event publication', error)
      return NextResponse.json({ error: '公開停止に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ publication })
  }

  if (body.action !== 'publish') {
    return NextResponse.json({ error: '操作内容を確認してください' }, { status: 400 })
  }

  if (offer.status !== 'confirmed') {
    return NextResponse.json(
      { error: '締結済みの案件のみ来店情報を公開できます' },
      { status: 409 }
    )
  }

  const now = new Date()
  let scheduledAt: Date | null = null

  if (body.publishAt) {
    const parsed = new Date(body.publishAt)
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: '公開日時を確認してください' }, { status: 400 })
    }
    if (parsed.getTime() > now.getTime()) {
      scheduledAt = parsed
    }
  }

  const publicNote =
    typeof body.publicNote === 'string' ? body.publicNote.trim().slice(0, 500) || null : null
  const showTime = body.showTime !== false
  const status = scheduledAt ? 'scheduled' : 'published'
  const slug = existing?.slug || createSlug(offer.date, offer.id)

  const values = {
    offer_id: offer.id,
    slug,
    status,
    publish_at: scheduledAt ? scheduledAt.toISOString() : now.toISOString(),
    published_at: scheduledAt ? null : now.toISOString(),
    show_time: showTime,
    public_note: publicNote,
    created_by: user.id,
  }

  let publication
  let error

  if (existing) {
    const result = await db
      .from('event_publications')
      .update({
        status: values.status,
        publish_at: values.publish_at,
        published_at: values.published_at,
        show_time: values.show_time,
        public_note: values.public_note,
      })
      .eq('id', existing.id)
      .select('id,offer_id,slug,status,publish_at,published_at,show_time,public_note')
      .single()

    publication = result.data
    error = result.error
  } else {
    const result = await db
      .from('event_publications')
      .insert(values)
      .select('id,offer_id,slug,status,publish_at,published_at,show_time,public_note')
      .single()

    publication = result.data
    error = result.error
  }

  if (error) {
    console.error('Failed to save event publication', error)
    return NextResponse.json({ error: '来店情報の公開設定に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ publication })
}
