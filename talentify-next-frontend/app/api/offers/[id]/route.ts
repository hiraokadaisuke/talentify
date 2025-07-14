import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { id } = params
  const { status } = await req.json()

  const { error } = await supabase
    .from('offers')
    .update({ status })
    .eq('id', id)

  if (error) {
    return NextResponse.json<{ error: string }>({ error: error.message }, { status: 500 })
  }

  // TODO: Notify performer or store about status change

  return NextResponse.json<{ message: string }>({ message: '更新しました' }, { status: 200 })
}
