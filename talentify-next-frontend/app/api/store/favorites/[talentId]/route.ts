import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'

async function getOwnedStore() {
  const supabase = createClient()
  const { user } = await getCurrentUser()

  if (!user) {
    return { supabase, store: null, status: 401 as const }
  }

  const { data: store, error } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !store) {
    return { supabase, store: null, status: 403 as const }
  }

  return { supabase, store, status: 200 as const }
}

export async function GET(
  _req: Request,
  { params }: { params: { talentId: string } },
) {
  const { supabase, store, status } = await getOwnedStore()

  if (!store) {
    return NextResponse.json(
      { error: status === 401 ? 'unauthenticated' : 'store_only' },
      { status },
    )
  }

  const db = supabase as any
  const { data, error } = await db
    .from('store_favorite_talents')
    .select('talent_id')
    .eq('store_id', store.id)
    .eq('talent_id', params.talentId)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ isFavorite: Boolean(data) })
}

export async function POST(
  _req: Request,
  { params }: { params: { talentId: string } },
) {
  const { supabase, store, status } = await getOwnedStore()

  if (!store) {
    return NextResponse.json(
      { error: status === 401 ? 'unauthenticated' : 'store_only' },
      { status },
    )
  }

  const db = supabase as any
  const { error } = await db
    .from('store_favorite_talents')
    .insert({
      store_id: store.id,
      talent_id: params.talentId,
    })

  if (error && error.code !== '23505') {
    if (error.code === '23503') {
      return NextResponse.json({ error: 'talent_not_found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ isFavorite: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: { talentId: string } },
) {
  const { supabase, store, status } = await getOwnedStore()

  if (!store) {
    return NextResponse.json(
      { error: status === 401 ? 'unauthenticated' : 'store_only' },
      { status },
    )
  }

  const db = supabase as any
  const { error } = await db
    .from('store_favorite_talents')
    .delete()
    .eq('store_id', store.id)
    .eq('talent_id', params.talentId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ isFavorite: false })
}
