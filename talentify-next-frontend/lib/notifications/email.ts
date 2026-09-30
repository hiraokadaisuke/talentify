import { createServiceClient } from '@/lib/supabase/service'
import type { NotificationEvent } from './config'
import type { NotificationPayload } from './payload'

const EMAIL_EVENT_KINDS = new Set<NotificationEvent['kind']>([
  'offer_created',
  'offer_updated',
  'offer_accepted',
  'invoice_submitted_to_store',
  'invoice_rejected_to_talent',
  'payment_completed_to_talent',
  'review_received',
])

type SendNotificationEmailInput = {
  recipientUserId: string
  event: NotificationEvent
  payload: NotificationPayload
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://talentify-xi.vercel.app'
  return raw.replace(/\/+$/, '')
}

function buildActionUrl(actionUrl: string | null | undefined) {
  if (!actionUrl || !actionUrl.startsWith('/')) return getSiteUrl()
  return `${getSiteUrl()}${actionUrl}`
}

export async function sendNotificationEmail({
  recipientUserId,
  event,
  payload,
}: SendNotificationEmailInput) {
  if (process.env.NOTIFICATION_EMAIL_ENABLED !== 'true') {
    return { status: 'disabled' as const }
  }

  if (!EMAIL_EVENT_KINDS.has(event.kind)) {
    return { status: 'not_applicable' as const }
  }

  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.NOTIFICATION_EMAIL_FROM?.trim()

  if (!apiKey || !from) {
    return { status: 'not_configured' as const }
  }

  const service = createServiceClient()
  const { data: recipient, error } = await service
    .from('users')
    .select('email')
    .eq('auth_user_id', recipientUserId)
    .maybeSingle()

  if (error) {
    throw new Error(`recipient email lookup failed: ${error.message}`)
  }

  const email = recipient?.email?.trim()
  if (!email) {
    return { status: 'recipient_email_missing' as const }
  }

  const title = payload.title || 'Talentifyからのお知らせ'
  const body = payload.body || ''
  const actionUrl = buildActionUrl(payload.action_url)
  const actionLabel = payload.action_label || 'Talentifyで確認する'
  const escapedTitle = escapeHtml(title)
  const escapedBody = escapeHtml(body)
  const escapedActionUrl = escapeHtml(actionUrl)
  const escapedActionLabel = escapeHtml(actionLabel)

  const html = `
    <div style="margin:0;padding:32px 16px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:28px;">
        <div style="font-size:20px;font-weight:800;margin-bottom:20px;">Talentify</div>
        <h1 style="font-size:20px;line-height:1.5;margin:0 0 12px;">${escapedTitle}</h1>
        <p style="font-size:14px;line-height:1.8;color:#475569;margin:0 0 24px;">${escapedBody}</p>
        <a href="${escapedActionUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 18px;border-radius:10px;">${escapedActionLabel}</a>
        <p style="font-size:12px;line-height:1.7;color:#94a3b8;margin:28px 0 0;">
          このメールはTalentifyの取引に関する通知です。
        </p>
      </div>
    </div>
  `

  const text = [
    title,
    '',
    body,
    '',
    `${actionLabel}: ${actionUrl}`,
    '',
    'このメールはTalentifyの取引に関する通知です。',
  ].join('\n')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `【Talentify】${title}`,
      html,
      text,
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Resend returned ${response.status}: ${detail.slice(0, 500)}`)
  }

  return { status: 'sent' as const }
}
