import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('talents')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }

  if (!data) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
    })
  }

  return new Response(JSON.stringify(data), {
    status: 200,
  })
}
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { name, email, profile } = await req.json()

  const { error } = await supabase
    .from('talents')
    .update({ name, email, profile })
    .eq('id', params.id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }

  return new Response(JSON.stringify({ message: '更新しました' }), {
    status: 200,
  })
}
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  const { error } = await supabase
    .from('talents')
    .delete()
    .eq('id', params.id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }

  return new Response(JSON.stringify({ message: '削除しました' }), {
    status: 200,
  })
}
