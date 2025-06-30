import { supabase } from '@/lib/supabaseClient'

export async function GET(request, { params }) {
  const { data, error } = await supabase.from('talents').select('*').eq('id', params.id).single()
  if (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 404 })
  }
  return Response.json(data)
}
