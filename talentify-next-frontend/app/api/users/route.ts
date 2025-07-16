import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient() as any

  const { data, error } = await supabase
    .from('users')
    .select('*')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }

  return new Response(JSON.stringify(data), {
    status: 200,
  })
}
