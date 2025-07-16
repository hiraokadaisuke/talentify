import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET() {
  // awaitをつけてSupabaseクライアントを取得
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  const query = supabase.from('schedules').select('*')
  if (user) query.eq('user_id', user.id)
  const { data, error } = await query

  if (error || userError) {
    return new Response(JSON.stringify({ error: (error || userError)?.message }), {
      status: 500,
    })
  }

  return new Response(JSON.stringify(data), { status: 200 })
}

export async function POST(req: NextRequest) {
  // awaitをつけてSupabaseクライアントを取得
  const supabase = await createClient()
  const body = await req.json()
  const { date, description } = body

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { data, error } = await supabase
    .from('schedules')
    .insert({ user_id: user.id, date, description })
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify(data), { status: 201 })
}
