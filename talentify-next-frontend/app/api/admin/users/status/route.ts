import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminContext, writeAdminAudit } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (!origin) return true
  try {
    return origin === new URL(request.url).origin
  } catch {
    return false
  }
}

const schema = z.object({
  userId: z.string().uuid(),
  status: z.enum(['active', 'suspended']),
})

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'invalid_origin' }, { status: 403 })
  }

  const admin = await getAdminContext()
  if (!admin.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!admin.isAdmin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
  }

  const service = createServiceClient() as any
  const { data: target, error: targetError } = await service
    .from('users')
    .select('id,auth_user_id,status')
    .eq('id', parsed.data.userId)
    .maybeSingle()

  if (targetError) {
    console.error('[admin] failed to load target user', targetError)
    return NextResponse.json({ error: 'user_lookup_failed' }, { status: 500 })
  }
  if (!target) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
  }
  if (target.auth_user_id === admin.user.id) {
    return NextResponse.json({ error: 'cannot_change_own_status' }, { status: 400 })
  }

  const { error } = await service
    .from('users')
    .update({
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.userId)

  if (error) {
    console.error('[admin] failed to update user status', error)
    return NextResponse.json({ error: 'user_update_failed' }, { status: 500 })
  }

  await writeAdminAudit({
    adminAuthUserId: admin.user.id,
    action: 'user_status_updated',
    targetType: 'user',
    targetId: parsed.data.userId,
    metadata: {
      from: target.status,
      to: parsed.data.status,
    },
  })

  return NextResponse.json({ ok: true })
}
