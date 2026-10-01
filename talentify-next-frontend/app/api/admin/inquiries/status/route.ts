import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminContext, writeAdminAudit } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'

const schema = z.object({
  inquiryId: z.string().uuid(),
  status: z.enum(['new', 'in_progress', 'resolved', 'spam']),
})

export async function POST(request: NextRequest) {
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
  const { data: inquiry, error: lookupError } = await service
    .from('contact_inquiries')
    .select('id,status')
    .eq('id', parsed.data.inquiryId)
    .maybeSingle()

  if (lookupError) {
    console.error('[admin] failed to load inquiry', lookupError)
    return NextResponse.json({ error: 'inquiry_lookup_failed' }, { status: 500 })
  }
  if (!inquiry) {
    return NextResponse.json({ error: 'inquiry_not_found' }, { status: 404 })
  }

  const { error } = await service
    .from('contact_inquiries')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.inquiryId)

  if (error) {
    console.error('[admin] failed to update inquiry', error)
    return NextResponse.json({ error: 'inquiry_update_failed' }, { status: 500 })
  }

  await writeAdminAudit({
    adminAuthUserId: admin.user.id,
    action: 'inquiry_status_updated',
    targetType: 'contact_inquiry',
    targetId: parsed.data.inquiryId,
    metadata: {
      from: inquiry.status,
      to: parsed.data.status,
    },
  })

  return NextResponse.json({ ok: true })
}
