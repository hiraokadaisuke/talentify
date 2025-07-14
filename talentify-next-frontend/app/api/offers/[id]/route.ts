import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const id = req.nextUrl.pathname.split('/').pop()
  const { status } = await req.json()

  const { error } = await supabase
    .from('offers')
    .update({ status })
    .eq('id', id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Notify performer or store about status change via webhook if configured
  const webhook = process.env.NOTIFICATION_WEBHOOK_URL
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId: id, status }),
      })
    } catch (err) {
      console.error('Failed to send notification:', err)
    }
  }

  return new Response(JSON.stringify({ message: '更新しました' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
