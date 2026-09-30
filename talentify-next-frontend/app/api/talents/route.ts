import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { isProfileComplete } from '@/utils/isProfileComplete'

export async function GET() {
  const supabase = createClient()
  const { data, error } = await supabase.from('talents').select('*')
  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
  return Response.json(data)
}

export async function POST(req: Request) {
  const supabase = createClient()
  const body = await req.json()
  const { user } = await getCurrentUser()

  if (!user) return Response.json({ error: 'unauthenticated' }, { status: 401 })

  const {
    name,
    profile,
    social_links = [],
    area,
    skills = [],
    experience_years = 0,
    avatar_url = '',
    location = '',
    rate = 0,
    availability = '',
    stage_name,
    genre,
    bio = '',
  } = body

  const normalizedArea = Array.isArray(area) ? JSON.stringify(area) : area
  const isComplete = isProfileComplete({
    stage_name, genre, area, rate, bio, profile, avatar_url,
  })

  const { data, error } = await supabase
    .from('talents')
    .upsert({
      user_id: user.id,
      name,
      profile,
      social_links,
      area: normalizedArea,
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
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
