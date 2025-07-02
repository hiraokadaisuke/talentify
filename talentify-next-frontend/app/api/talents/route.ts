import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('talents')
    .select('*') // 新カラム含めてすべて取得

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }

  return new Response(JSON.stringify(data), {
    status: 200,
  })
}

export async function POST(req: Request) {
  const supabase = createClient()
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
    })
  }

  return new Response(JSON.stringify(data), {
    status: 201,
  })
}
