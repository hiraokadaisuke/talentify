import { createClient } from '@/lib/supabase/server'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('talents')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return new Response(JSON.stringify({ error: error?.message ?? 'Not found' }), {
      status: 404,
    })
  }

  return new Response(JSON.stringify(data), {
    status: 200,
  })
}
