import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isProfileComplete } from '@/utils/isProfileComplete'
import { j } from '@/utils/nullSafe'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { id } = params
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const fields = 'id,user_id,stage_name,profile,residence,area,genre,availability,min_hours,transportation,rate,notes,media_appearance,video_url,avatar_url,photos,twitter_url,instagram_url,youtube_url,is_setup_complete' as const
  const { data, error } = await supabase
    .from('talents')
    .select(fields)
    .eq('id', id)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: '演者が見つかりません' }, { status: 404 })
  }

  return NextResponse.json({
    ...data,
    area: j<string[]>(data.area, []),
    photos: data.photos ?? [],
    twitter: data.twitter_url,
    instagram: data.instagram_url,
    youtube: data.youtube_url,
  })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const body = await req.json()
  const {
    name, profile, social_links, area, skills, experience_years,
    avatar_url, location, rate, availability, stage_name, genre, bio,
  } = body

  const isComplete = isProfileComplete({
    stage_name, genre, area, rate, bio, profile, avatar_url,
  })

  const { error } = await supabase
    .from('talents')
    .update({
      name,
      profile,
      social_links,
      area: Array.isArray(area) ? JSON.stringify(area) : area,
      skills,
      experience_years,
      avatar_url,
      location,
      rate,
      availability,
      stage_name,
      genre,
      bio,
      is_setup_complete: true,
      is_profile_complete: isComplete,
    })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: '更新しました' })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { error } = await supabase.from('talents').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: '削除しました' })
}
