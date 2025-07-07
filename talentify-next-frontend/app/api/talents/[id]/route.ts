import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()

  // ID を URL から取得
  const id = req.nextUrl.pathname.split('/').pop()

  const { data, error } = await supabase
    .from('talents')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify(data), { status: 200 })
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const id = req.nextUrl.pathname.split('/').pop()

  const { name, email, profile } = await req.json()

  const { error } = await supabase
    .from('talents')
    .update({ name, email, profile })
    .eq('id', id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ message: '更新しました' }), { status: 200 })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const id = req.nextUrl.pathname.split('/').pop()

  const { error } = await supabase
    .from('talents')
    .delete()
    .eq('id', id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ message: '削除しました' }), { status: 200 })
}
