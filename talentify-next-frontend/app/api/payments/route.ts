import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const PatchSchema = z.object({
  id: z.string(),
  status: z.literal('completed').optional(),
  paid_at: z.string().datetime().optional(),
})

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  let json: any
  try {
    json = await req.json()
  } catch (e) {
    return NextResponse.json(
      { data: null, error: 'invalid json body' },
      { status: 400 }
    )
  }
  const parsed = PatchSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.message },
      { status: 400 }
    )
  }
  const { id, ...fields } = parsed.data

  if (Object.keys(fields).length === 0) {
    fields.status = 'completed'
  }

  const { data, error } = await supabase
    .from('payments')
    .update(fields)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    const status = error.code === '42501' ? 403 : 400
    logger.error('[PATCH /api/payments] update failed', { error })
    return NextResponse.json({ data: null, error: error.message }, { status })
  }

  return NextResponse.json({ data, error: null })
}

export function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}
export const POST = GET
export const PUT = GET
export const DELETE = GET
