import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isProfileComplete } from '@/utils/isProfileComplete'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  const { id } = params

  if (!id) {
    console.error('GET /api/talents/[id] called without id')
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const fields = 'id,user_id,stage_name,profile,residence,area,genre,availability,min_hours,transportation,rate,notes,media_appearance,video_url,avatar_url,photos,x,instagram,youtube,is_setup_complete' as const

  const { data, error } = await supabase
    .from('talents')
    .select(fields)
    .eq('id', id)
    .maybeSingle<any>()

  if (error || !data) {
    if (error) {
      console.error('Supabase fetch error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
    }
    return NextResponse.json({ error: 'タレントが見つかりません' }, { status: 404 })
  }

  const result = {
    id: data.id,
    user_id: data.user_id,
    stage_name: data.stage_name,
    profile: data.profile,
    residence: data.residence,
    area: data.area ?? [],
    genre: data.genre,
    availability: data.availability,
    min_hours: data.min_hours,
    transportation: data.transportation,
    rate: data.rate,
    notes: data.notes,
    media_appearance: data.media_appearance,
    video_url: data.video_url,
    avatar_url: data.avatar_url,
    photos: data.photos ?? [],
    twitter: data.x,
    instagram: data.instagram,
    youtube: data.youtube,
    is_setup_complete: data.is_setup_complete,
  }

  return NextResponse.json(result, { status: 200 })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { id } = params
  const body = await req.json()

  const {
    name,
    email,
    profile,
    sns_links,
    area,
    skills,
    experience_years,
    avatar_url,
    location,
    rate,
    availability,
    stage_name,
    genre,
    bio,
  } = body

  const isComplete = isProfileComplete({
    stage_name,
    genre,
    area,
    rate,
    bio,
    profile,
    avatar_url,
  })

  const { error } = await supabase
    .from('talents')
    .update({
      name,
      email,
      profile,
      sns_links,
    area,
      skills,
      experience_years,
      avatar_url,
      location,
      rate,
      availability,
      stage_name,
      genre,
      bio,
      is_profile_complete: isComplete,
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json<{ error: string }>({ error: error.message }, { status: 500 })
  }

  return NextResponse.json<{ message: string }>({ message: '更新しました' }, { status: 200 })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { id } = params

  const { error } = await supabase
    .from('talents')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json<{ error: string }>({ error: error.message }, { status: 500 })
  }

  return NextResponse.json<{ message: string }>({ message: '削除しました' }, { status: 200 })
}
