import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createServiceClient } from '@/lib/supabase/service'

export async function PATCH(req: NextRequest) {
  try {
    const { user, error: userError } = await getCurrentUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const phone = typeof body?.phone === 'string' ? body.phone.replace(/\D/g, '') : ''

    if (!/^\d{10,11}$/.test(phone)) {
      return NextResponse.json(
        { error: '電話番号は10〜11桁で入力してください' },
        { status: 400 },
      )
    }

    const service = createServiceClient()
    const { data: appUser, error: userLookupError } = await service
      .from('users')
      .select('role')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (userLookupError || !appUser) {
      return NextResponse.json({ error: 'account_not_found' }, { status: 404 })
    }

    const now = new Date().toISOString()
    const { error: updateError } = await service
      .from('users')
      .update({ phone, updated_at: now })
      .eq('auth_user_id', user.id)

    if (updateError) throw updateError

    if (appUser.role === 'store') {
      const { error: storeError } = await service
        .from('stores')
        .update({ contact_phone: phone, updated_at: now })
        .eq('user_id', user.id)
      if (storeError) throw storeError
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[PATCH /api/account/phone]', error)
    return NextResponse.json({ error: 'phone_update_failed' }, { status: 500 })
  }
}
