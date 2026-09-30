import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

const EMPTY_PAYOUT = {
  bank_name: '',
  branch_name: '',
  account_type: '',
  account_number: '',
  account_holder: '',
}

export async function GET() {
  const supabase = createClient()
  const { user } = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('talent_payout_accounts')
    .select('bank_name, branch_name, account_type, account_number, account_holder')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? EMPTY_PAYOUT)
}

export async function PATCH(req: Request) {
  const supabase = createClient()
  const { user } = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const { data: talent, error: talentError } = await supabase
    .from('talents')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (talentError || !talent) {
    return NextResponse.json({ error: 'talent_not_found' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }

  const value = (key: string) =>
    typeof (body as Record<string, unknown>)[key] === 'string'
      ? String((body as Record<string, unknown>)[key]).trim()
      : ''

  const { error } = await supabase
    .from('talent_payout_accounts')
    .upsert(
      {
        talent_id: talent.id,
        user_id: user.id,
        bank_name: value('bank_name') || null,
        branch_name: value('branch_name') || null,
        account_type: value('account_type') || null,
        account_number: value('account_number') || null,
        account_holder: value('account_holder') || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'talent_id' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: '更新しました' })
}
