import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createServiceClient } from '@/lib/supabase/service'

const schema = z.object({ role: z.enum(['store', 'talent']) })

export async function POST(req: NextRequest) {
  const { user } = await getCurrentUser()
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: appUser, error: appUserError } = await service
    .from('users')
    .select('role, status')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (appUserError) {
    return NextResponse.json({ error: 'Failed to load account' }, { status: 500 })
  }

  if (appUser?.role === 'store' || appUser?.role === 'talent') {
    return NextResponse.json({
      ok: true,
      next: appUser.role === 'store' ? '/store/edit' : '/talent/edit',
    })
  }

  const [{ data: store }, { data: talent }] = await Promise.all([
    service.from('stores').select('id').eq('user_id', user.id).maybeSingle(),
    service.from('talents').select('id').eq('user_id', user.id).maybeSingle(),
  ])

  if (store || talent) {
    return NextResponse.json({ error: 'Account role is inconsistent' }, { status: 409 })
  }

  const { error } = await service
    .from('users')
    .upsert(
      {
        auth_user_id: user.id,
        email: user.email,
        role: parsed.data.role,
        status: 'onboarding',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'auth_user_id' }
    )

  if (error) {
    return NextResponse.json({ error: 'Failed to save role' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    next: parsed.data.role === 'store' ? '/store/edit' : '/talent/edit',
  })
}
