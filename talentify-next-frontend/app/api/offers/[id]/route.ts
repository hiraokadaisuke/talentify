import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { id } = params
  const { status } = await req.json()

  const { error } = await supabase
    .from('offers')
    .update({ status })
    .eq('id', id)

  if (error) {
    return NextResponse.json<{ error: string }>({ error: error.message }, { status: 500 })
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

  return NextResponse.json<{ message: string }>({ message: '更新しました' }, { status: 200 })
}
