import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 })
}
