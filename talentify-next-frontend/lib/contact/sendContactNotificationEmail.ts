type ContactNotificationInput = {
  inquiryId: string
  createdAt: string
  category: 'service' | 'bug' | 'feedback' | 'other'
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
}

const CATEGORY_LABELS: Record<ContactNotificationInput['category'], string> = {
  service: 'サービスについて',
  bug: '不具合報告',
  feedback: 'ご意見・ご要望',
  other: 'その他',
}

export async function sendContactNotificationEmail(
  inquiry: ContactNotificationInput
) {
  if (process.env.CONTACT_EMAIL_ENABLED !== 'true') {
    return { status: 'disabled' as const }
  }

  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.NOTIFICATION_EMAIL_FROM?.trim()
  const to = process.env.CONTACT_NOTIFICATION_EMAIL?.trim()

  if (!apiKey || !from || !to) {
    return { status: 'not_configured' as const }
  }

  const safeSubject = inquiry.subject.replace(/[\r\n]+/g, ' ').slice(0, 160)
  const text = [
    'Talentifyに新しいお問い合わせが届きました。',
    '',
    `受付ID: ${inquiry.inquiryId}`,
    `受付日時: ${inquiry.createdAt}`,
    `種別: ${CATEGORY_LABELS[inquiry.category]}`,
    `お名前: ${inquiry.name}`,
    `メール: ${inquiry.email}`,
    `電話番号: ${inquiry.phone || '未入力'}`,
    `件名: ${inquiry.subject}`,
    '',
    'お問い合わせ内容:',
    inquiry.message,
  ].join('\n')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `【Talentifyお問い合わせ】${safeSubject}`,
      text,
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(
      `Resend returned ${response.status}: ${detail.slice(0, 500)}`
    )
  }

  return { status: 'sent' as const }
}
