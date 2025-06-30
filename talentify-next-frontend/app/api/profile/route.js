import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle()
  if (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 })
  }
  return Response.json(data)
}

export async function POST(request) {
  const body = await request.json()
  const { data, error } = await supabase.from('profiles').upsert(body).select().single()
  if (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 400 })
  }
  return Response.json(data)
}
