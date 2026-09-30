import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'

const EMPTY_BILLING_PROFILE = {
  billing_name: '',
  billing_address: '',
  invoice_registration_number: '',
}

function readText(body: Record<string, unknown>, key: string) {
  const value = body[key]
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeRegistrationNumber(value: string) {
  return value.toUpperCase().replace(/[\s-]/g, '')
}

export async function GET() {
  const supabase = createClient()
  const { user } = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const { data: talent, error: talentError } = await supabase
    .from('talents')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (talentError || !talent) {
    return NextResponse.json({ error: 'talent_not_found' }, { status: 404 })
  }

  const db = supabase as any
  const { data, error } = await db
    .from('talent_billing_profiles')
    .select('billing_name,billing_address,invoice_registration_number')
    .eq('talent_id', talent.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? EMPTY_BILLING_PROFILE)
}

export async function PATCH(req: Request) {
  const supabase = createClient()
  const { user } = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const { data: talent, error: talentError } = await supabase
    .from('talents')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (talentError || !talent) {
    return NextResponse.json({ error: 'talent_not_found' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }

  const values = body as Record<string, unknown>
  const billingName = readText(values, 'billing_name')
  const billingAddress = readText(values, 'billing_address')
  const registrationNumber = normalizeRegistrationNumber(
    readText(values, 'invoice_registration_number'),
  )

  if (billingName.length > 160 || billingAddress.length > 500) {
    return NextResponse.json({ error: 'value_too_long' }, { status: 400 })
  }

  if (registrationNumber && !/^T\d{13}$/.test(registrationNumber)) {
    return NextResponse.json(
      {
        error: 'invalid_invoice_registration_number',
        message: '登録番号はTから始まる13桁の数字で入力してください',
      },
      { status: 400 },
    )
  }

  const db = supabase as any
  const { error } = await db
    .from('talent_billing_profiles')
    .upsert(
      {
        talent_id: talent.id,
        user_id: user.id,
        billing_name: billingName || null,
        billing_address: billingAddress || null,
        invoice_registration_number: registrationNumber || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'talent_id' },
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
