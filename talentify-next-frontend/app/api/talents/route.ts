import { createClient } from '@/lib/supabase/server'
import { isProfileComplete } from '@/utils/isProfileComplete'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('talents')
    .select('*')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const body = await req.json()

  const {
    name,
    profile,
    sns_links,
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

  const isComplete = isProfileComplete({
    stage_name,
    genre,
    area,
    rate,
    bio,
    profile,
    avatar_url,
  })

  const { data, error } = await supabase
    .from('talents')
    .insert([
      {
        name,
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
      },
    ])
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  })
}
