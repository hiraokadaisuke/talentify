import { createClient } from '@/lib/supabase/server'

export async function GET() {
  // awaitをつける
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("users" as any)
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
