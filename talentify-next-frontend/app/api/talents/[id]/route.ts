import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  const { data, error } = await supabase
    .from('talents')
    .select(
      [
        'id',
        'user_id',
        'stage_name',
        'birthdate',
        'gender',
        'residence',
        'birthplace',
        'height_cm',
        'agency_name',
        'agency_url',
        'avatar_url',
        'photos',
        'area',
        'bio_hobby',
        'bio_certifications',
        'bio_others',
        'media_appearance',
        'social_x',
        'social_instagram',
        'social_youtube',
      ].join(',')
    )
    .eq('id', id)
    .maybeSingle()

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
    birthdate: data.birthdate,
    gender: data.gender,
    residence: data.residence,
    birthplace: data.birthplace,
    height: data.height_cm,
    agency: data.agency_name,
    agency_url: data.agency_url,
    profile_photo: data.avatar_url,
    photos: data.photos ?? [],
    area: data.area ?? [],
    hobby: data.bio_hobby,
    certifications: data.bio_certifications,
    notes: data.bio_others,
    media_appearance: data.media_appearance,
    twitter: data.social_x,
    instagram: data.social_instagram,
    youtube: data.social_youtube,
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
    bio,
    skills,
    experience_years,
    avatar_url,
    location,
    rate,
    availability,
  } = body

  const { error } = await supabase
    .from('talents')
    .update({
      name,
      email,
      profile,
      sns_links,
      area,
      bio,
      skills,
      experience_years,
      avatar_url,
      location,
      rate,
      availability,
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
