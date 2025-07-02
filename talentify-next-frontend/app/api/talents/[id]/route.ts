import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, context: { params: { id: string } }) {
  const supabase = createClient()
  const { id } = context.params

  const { data, error } = await supabase
    .from('talents')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }

  if (!data) {
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
    })
  }

  return new Response(JSON.stringify(data), { status: 200 })
}
