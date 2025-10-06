import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { toDbOfferStatus } from '@/app/lib/offerStatus'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    const body = await req.json()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json<{ error: string }>({ error: '認証が必要です' }, { status: 401 })
    }

    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('store:store_id(user_id), talent:talent_id(user_id)')
      .eq('id', id)
      .single()
    if (offerError || !offer) {
      return NextResponse.json<{ error: string }>({ error: 'オファーが見つかりません' }, { status: 404 })
    }

    let allowedFields: string[] = []
    const storeUserId = (offer as any).store?.user_id as string | undefined
    const talentUserId = (offer as any).talent?.user_id as string | undefined
    if (storeUserId && user.id === storeUserId) {
      allowedFields = ['status', 'contract_url']
    } else if (talentUserId && user.id === talentUserId) {
      allowedFields = [
        'status',
        'agreed',
        'invoice_date',
        'invoice_amount',
        'bank_name',
        'bank_branch',
        'bank_account_number',
        'bank_account_holder',
        'invoice_submitted',
        'invoice_url',
      ]
    } else {
      return NextResponse.json<{ error: string }>({ error: '権限がありません' }, { status: 403 })
    }

    const updates: Record<string, any> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field]
    }

    if (updates.status !== undefined) {
      const normalizedStatus = toDbOfferStatus(updates.status)
      if (normalizedStatus) updates.status = normalizedStatus
      else delete updates.status
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json<{ error: string }>({ error: '更新可能な項目がありません' }, { status: 400 })
    }

    const { error } = await supabase.from('offers').update(updates).eq('id', id)

    if (error) throw error

    // Notify performer or store about status change via webhook if configured
    const webhook = process.env.NOTIFICATION_WEBHOOK_URL
    if (webhook) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offerId: id,
            status: updates.status,
            contract_url: updates.contract_url,
            agreed: updates.agreed,
          }),
        })
      } catch (err) {
        console.error('Failed to send notification:', err)
      }
    }

    return NextResponse.json<{ message: string }>({ message: '更新しました' }, { status: 200 })
  } catch (e) {
    console.error('[PUT /offers/:id]', e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
