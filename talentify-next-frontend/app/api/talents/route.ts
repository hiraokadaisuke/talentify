import { createClient } from '@/lib/supabase/server'

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
    email,
    profile,
    sns_links,
    area,
    bio,
    skills = [],
    experience_years = 0,
    avatar_url = '',
    location = '',
    rate = 0,
    availability = '',
  } = body

  const { data, error } = await supabase
    .from('talents')
    .insert([
      {
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
