import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

const BUCKET = 'invoices'
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient()
  const { user, error: userError } = await getCurrentUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: talent, error: talentError } = await supabase
    .from('talents')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (talentError || !talent) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id,talent_id,status,invoice_url')
    .eq('id', params.id)
    .single()

  if (invoiceError || !invoice) {
    return NextResponse.json({ error: 'invoice_not_found' }, { status: 404 })
  }
  if (invoice.talent_id !== talent.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  if (invoice.status !== 'draft') {
    return NextResponse.json({ error: 'invoice_not_editable' }, { status: 409 })
  }

  const formData = await req.formData()
  const entry = formData.get('file')
  if (!entry || typeof entry === 'string') {
    return NextResponse.json({ error: 'pdf_required' }, { status: 400 })
  }

  const file = entry as File
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'pdf_only' }, { status: 400 })
  }
  if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'invalid_file_size' }, { status: 400 })
  }

  const service = createServiceClient()
  const path = `${invoice.id}/${randomUUID()}.pdf`
  const bytes = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await service.storage
    .from(BUCKET)
    .upload(path, bytes, {
      contentType: 'application/pdf',
      cacheControl: '0',
      upsert: false,
    })

  if (uploadError) {
    console.error('[invoice attachment upload]', uploadError)
    return NextResponse.json({ error: 'upload_failed' }, { status: 500 })
  }

  const { data: updated, error: updateError } = await service
    .from('invoices')
    .update({ invoice_url: path })
    .eq('id', invoice.id)
    .eq('status', 'draft')
    .select('id')
    .maybeSingle()

  if (updateError || !updated) {
    await service.storage.from(BUCKET).remove([path])
    return NextResponse.json({ error: 'invoice_not_editable' }, { status: 409 })
  }

  const oldPath = invoice.invoice_url
  if (oldPath && !oldPath.includes('://') && oldPath !== path) {
    const { error: removeError } = await service.storage.from(BUCKET).remove([oldPath])
    if (removeError) {
      console.error('[invoice attachment cleanup]', removeError)
    }
  }

  return NextResponse.json({ path }, { status: 200 })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient()
  const { user, error: userError } = await getCurrentUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id,store_id,talent_id,invoice_url,invoice_number')
    .eq('id', params.id)
    .single()

  if (invoiceError || !invoice) {
    return NextResponse.json({ error: 'invoice_not_found' }, { status: 404 })
  }

  const [{ data: store }, { data: talent }] = await Promise.all([
    supabase.from('stores').select('id').eq('user_id', user.id).maybeSingle(),
    supabase.from('talents').select('id').eq('user_id', user.id).maybeSingle(),
  ])

  const authorized =
    store?.id === invoice.store_id || talent?.id === invoice.talent_id
  if (!authorized) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const path = invoice.invoice_url
  if (!path || path.includes('://')) {
    return NextResponse.json({ error: 'attachment_not_found' }, { status: 404 })
  }

  const service = createServiceClient()
  const { data, error: downloadError } = await service.storage
    .from(BUCKET)
    .download(path)

  if (downloadError || !data) {
    console.error('[invoice attachment download]', downloadError)
    return NextResponse.json({ error: 'attachment_not_found' }, { status: 404 })
  }

  const bytes = new Uint8Array(await data.arrayBuffer())
  const safeNumber = String(invoice.invoice_number ?? invoice.id)
    .replace(/[^A-Za-z0-9_.-]/g, '_')

  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="estimate-${safeNumber}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
