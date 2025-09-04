import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }
  const { data, error } = await supabase
    .from('talents')
    .select('bank_name, branch_name, account_type, account_number, account_holder')
    .eq('user_id', user.id)
    .single()
  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'not found' }, { status: 404 })
  }
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }
  const body = await req.json()
  const updates = {
    bank_name: body.bank_name,
    branch_name: body.branch_name,
    account_type: body.account_type,
    account_number: body.account_number,
    account_holder: body.account_holder,
  }
  const { error } = await supabase.from('talents').update(updates).eq('user_id', user.id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ message: '更新しました' }, { status: 200 })
}
