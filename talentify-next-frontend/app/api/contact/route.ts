import { createHmac } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { sendContactNotificationEmail } from '@/lib/contact/sendContactNotificationEmail'

export const runtime = 'nodejs'

const RATE_LIMIT_WINDOW_MINUTES = 10
const RATE_LIMIT_MAX = 10

const contactSchema = z.object({
  category: z.enum(['service', 'bug', 'feedback', 'other']),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).optional().default(''),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
  website: z.string().max(200).optional().default(''),
})

function sourceHash(request: NextRequest) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')

  const forwarded = request.headers.get('x-forwarded-for')
  const ip =
    forwarded?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    'unknown'

  return createHmac('sha256', secret)
    .update(`contact:${ip}`)
    .digest('hex')
}

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (!origin) return true

  try {
    return origin === new URL(request.url).origin
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: '不正な送信元です' }, { status: 403 })
  }

  const json = await request.json().catch(() => null)
  const parsed = contactSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { error: '入力内容を確認してください' },
      { status: 400 }
    )
  }

  // Honeypot: bots commonly fill hidden website fields.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  const service = createServiceClient() as any
  const hash = sourceHash(request)
  const windowStart = new Date(
    Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
  ).toISOString()

  const { count, error: countError } = await service
    .from('contact_inquiries')
    .select('id', { count: 'exact', head: true })
    .eq('source_hash', hash)
    .gte('created_at', windowStart)

  if (countError) {
    console.error('[contact] rate limit lookup failed', countError)
    return NextResponse.json(
      { error: '送信処理でエラーが発生しました。時間をおいて再度お試しください' },
      { status: 500 }
    )
  }

  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return NextResponse.json(
      { error: '短時間に送信回数が多すぎます。時間をおいて再度お試しください' },
      { status: 429 }
    )
  }

  const inquiry = {
    category: parsed.data.category,
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone || null,
    subject: parsed.data.subject,
    message: parsed.data.message,
    source_hash: hash,
  }

  const { data, error } = await service
    .from('contact_inquiries')
    .insert(inquiry)
    .select('id,created_at')
    .single()

  if (error || !data) {
    console.error('[contact] insert failed', error)
    return NextResponse.json(
      { error: 'お問い合わせを保存できませんでした。時間をおいて再度お試しください' },
      { status: 500 }
    )
  }

  try {
    await sendContactNotificationEmail({
      ...inquiry,
      inquiryId: data.id,
      createdAt: data.created_at,
    })
  } catch (notificationError) {
    // The inquiry is already safely stored. Notification failure must not
    // turn a successful reception into a user-visible failure.
    console.error('[contact] notification email failed', notificationError)
  }

  return NextResponse.json({
    ok: true,
    reference: String(data.id).split('-')[0].toUpperCase(),
  })
}
