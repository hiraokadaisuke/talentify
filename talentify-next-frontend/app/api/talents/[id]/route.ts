import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { id } = params

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

  return new Response(JSON.stringify(data), {
    status: 200,
  })
}
