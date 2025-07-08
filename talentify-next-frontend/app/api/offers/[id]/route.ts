import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const id = req.nextUrl.pathname.split('/').pop()
  const { status } = await req.json()

  const { error } = await supabase
    .from('offers')
    .update({ status })
    .eq('id', id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // TODO: Notify performer or store about status change

  return new Response(JSON.stringify({ message: '更新しました' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
