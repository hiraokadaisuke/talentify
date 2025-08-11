import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user.id},topic.eq.${user.id}`)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { topic, content } = await req.json()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: user.id, topic, content })
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'not found' }, { status: 500 })
  }

  if (topic) {
    await supabase.from('notifications').insert({
      user_id: topic,
      type: 'message',
      title: '新着メッセージがあります',
      body: content ?? null
    })
  }

  return NextResponse.json(data, { status: 201 })
}
