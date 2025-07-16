export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  const { id } = params

  const { data, error } = await supabase
    .from('talents')
    .select(
      'stage_name,birthdate,gender,residence,birthplace,height_cm,agency_name,' +
        'social_x,social_instagram,social_youtube,social_tiktok,photos,' +
        'bio_hobby,bio_certifications,bio_others,media_appearance,' +
        'id,name,email,profile,sns_links,area,bio,skills,experience_years,' +
        'avatar_url,location,rate,availability'
    )
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return NextResponse.json<{ error: string }>({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 200 })
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
