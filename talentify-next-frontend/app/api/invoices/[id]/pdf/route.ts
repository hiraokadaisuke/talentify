import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

type BillingRow = {
  billing_name: string | null
  billing_address: string | null
  invoice_registration_number: string | null
} | null

type PayoutRow = {
  bank_name: string | null
  branch_name: string | null
  account_type: string | null
  account_number: string | null
  account_holder: string | null
} | null

type ContractSnapshot = {
  version: 1
  captured_at: string
  store_name: string
  store_address?: string | null
  store_contact_name?: string | null
  talent_name: string
  billing?: BillingRow
  invoice: {
    invoice_number: string
    amount: number
    transport_fee: number
    extra_fee: number
    due_date: string | null
    notes: string | null
  }
  payout: PayoutRow
}

type InvoiceRow = {
  id: string
  amount: number
  transport_fee: number | null
  extra_fee: number | null
  invoice_number: string
  status: string | null
  due_date: string | null
  created_at: string | null
  updated_at: string | null
  store_id: string
  talent_id: string
  contract_snapshot: unknown
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

function readContractSnapshot(value: unknown): ContractSnapshot | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const snapshot = value as Record<string, unknown>
  const invoice = snapshot.invoice
  if (
    snapshot.version !== 1 ||
    typeof snapshot.captured_at !== 'string' ||
    typeof snapshot.store_name !== 'string' ||
    typeof snapshot.talent_name !== 'string' ||
    !invoice ||
    typeof invoice !== 'object' ||
    Array.isArray(invoice)
  ) {
    return null
  }

  const invoiceData = invoice as Record<string, unknown>
  if (
    typeof invoiceData.invoice_number !== 'string' ||
    typeof invoiceData.amount !== 'number' ||
    typeof invoiceData.transport_fee !== 'number' ||
    typeof invoiceData.extra_fee !== 'number' ||
    !isNullableString(invoiceData.due_date) ||
    !isNullableString(invoiceData.notes)
  ) {
    return null
  }

  const billing = snapshot.billing
  if (billing !== undefined && billing !== null) {
    if (!billing || typeof billing !== 'object' || Array.isArray(billing)) return null
    const billingData = billing as Record<string, unknown>
    if (
      !isNullableString(billingData.billing_name) ||
      !isNullableString(billingData.billing_address) ||
      !isNullableString(billingData.invoice_registration_number)
    ) {
      return null
    }
  }

  const payout = snapshot.payout
  if (payout !== null) {
    if (!payout || typeof payout !== 'object' || Array.isArray(payout)) return null
    const payoutData = payout as Record<string, unknown>
    if (
      !isNullableString(payoutData.bank_name) ||
      !isNullableString(payoutData.branch_name) ||
      !isNullableString(payoutData.account_type) ||
      !isNullableString(payoutData.account_number) ||
      !isNullableString(payoutData.account_holder)
    ) {
      return null
    }
  }

  return snapshot as unknown as ContractSnapshot
}

function toUtf16BeHex(value: string) {
  let hex = ''
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i)
    if (code >= 0xd800 && code <= 0xdfff) {
      hex += '003F'
      if (code <= 0xdbff && i + 1 < value.length) i += 1
      continue
    }
    hex += code.toString(16).padStart(4, '0').toUpperCase()
  }
  return hex
}

function toPdfAscii(value: string) {
  return value
    .replace(/[^\x20-\x7E]/g, '?')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function buildInvoicePdf(params: {
  invoice: InvoiceRow
  storeName: string
  storeAddress: string | null
  talentName: string
  billing: BillingRow
  payout: PayoutRow
}) {
  const { invoice, storeName, storeAddress, talentName, billing, payout } = params
  const pageWidth = 595
  const pageHeight = 842
  const commands: string[] = []

  const jp = (text: string, x: number, y: number, size = 11) => {
    commands.push(
      `BT /FJ ${size} Tf 1 0 0 1 ${x} ${y} Tm <${toUtf16BeHex(text)}> Tj ET`
    )
  }
  const latin = (text: string, x: number, y: number, size = 11) => {
    commands.push(
      `BT /FL ${size} Tf 1 0 0 1 ${x} ${y} Tm (${toPdfAscii(text)}) Tj ET`
    )
  }
  const line = (x1: number, y1: number, x2: number, y2: number, width = 0.6) => {
    commands.push(`q 0.72 G ${width} w ${x1} ${y1} m ${x2} ${y2} l S Q`)
  }
  const box = (x: number, y: number, width: number, height: number) => {
    commands.push(`q 0.96 g ${x} ${y} ${width} ${height} re f Q`)
    commands.push(`q 0.72 G 0.6 w ${x} ${y} ${width} ${height} re S Q`)
  }

  const formatDate = (value: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value.slice(0, 10).replace(/-/g, '/')
    return new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
  }
  const money = (value: number) => Math.max(0, value).toLocaleString('ja-JP')
  const baseFee = Math.max(
    0,
    invoice.amount - (invoice.transport_fee ?? 0) - (invoice.extra_fee ?? 0)
  )

  const isContracted = invoice.status === 'approved'
  const documentTitle = isContracted ? '取引締結書兼請求書' : '見積書'

  jp(documentTitle, isContracted ? 198 : 255, 790, isContracted ? 18 : 22)
  latin(invoice.invoice_number, 402, 794, 9)
  line(50, 775, 545, 775, 1)

  jp('請求先', 50, 742, 9)
  jp(storeName || '店舗名未設定', 50, 716, 15)
  if (storeAddress) jp(storeAddress, 50, 696, 8)
  jp('請求元', 330, 742, 9)
  jp(billing?.billing_name || talentName || '演者名未設定', 330, 716, 15)
  if (billing?.billing_address) jp(billing.billing_address, 330, 696, 8)
  if (billing?.invoice_registration_number) {
    jp('登録番号', 330, 678, 8)
    latin(billing.invoice_registration_number, 385, 678, 8)
  }

  box(50, 635, 495, 54)
  jp(isContracted ? 'ご請求金額' : 'お見積金額', 66, 655, 11)
  latin(money(invoice.amount), 330, 653, 18)
  jp('円', 482, 655, 11)

  jp(isContracted ? '締結・請求情報' : '見積情報', 50, 600, 13)
  line(50, 590, 545, 590)
  jp(isContracted ? '締結日' : '見積作成日', 60, 566, 10)
  latin(formatDate(isContracted ? invoice.updated_at : invoice.created_at), 210, 566, 10)
  jp(isContracted ? '締結書兼請求書番号' : '管理番号', 60, 542, 10)
  latin(invoice.invoice_number, 210, 542, 10)
  jp('支払期限', 60, 518, 10)
  latin(formatDate(invoice.due_date), 210, 518, 10)

  jp('金額内訳', 50, 478, 13)
  line(50, 468, 545, 468)
  jp('基本報酬', 60, 444, 10)
  latin(money(baseFee), 420, 444, 10)
  jp('円', 510, 444, 10)
  jp('交通費', 60, 420, 10)
  latin(money(invoice.transport_fee ?? 0), 420, 420, 10)
  jp('円', 510, 420, 10)
  jp('追加料金', 60, 396, 10)
  latin(money(invoice.extra_fee ?? 0), 420, 396, 10)
  jp('円', 510, 396, 10)
  line(330, 384, 535, 384)
  jp('合計', 330, 360, 11)
  latin(money(invoice.amount), 420, 360, 12)
  jp('円', 510, 360, 10)

  jp(isContracted ? '振込先情報' : '確認事項', 50, 320, 13)
  line(50, 310, 545, 310)

  if (!isContracted) {
    jp('本見積はホール承認後に取引条件として確定します。', 60, 282, 10)
  } else if (payout) {
    const payoutRows: Array<[string, string, boolean]> = [
      ['銀行名', payout.bank_name ?? '-', false],
      ['支店名', payout.branch_name ?? '-', false],
      ['口座種別', payout.account_type ?? '-', false],
      ['口座番号', payout.account_number ?? '-', true],
      ['口座名義', payout.account_holder ?? '-', false],
    ]
    let y = 286
    for (const [label, value, ascii] of payoutRows) {
      jp(label, 60, y, 10)
      if (ascii) latin(value, 210, y, 10)
      else jp(value, 210, y, 10)
      y -= 24
    }
  } else {
    jp('振込先情報が登録されていません', 60, 282, 10)
  }

  jp('Talentify', 50, 70, 9)
  latin(invoice.invoice_number, 430, 70, 8)

  const stream = commands.join('\n') + '\n'
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /FJ 4 0 R /FL 6 0 R >> >> /Contents 7 0 R >>`,
    '<< /Type /Font /Subtype /Type0 /BaseFont /HeiseiKakuGo-W5 /Encoding /UniJIS-UCS2-H /DescendantFonts [5 0 R] >>',
    '<< /Type /Font /Subtype /CIDFontType0 /BaseFont /HeiseiKakuGo-W5 /CIDSystemInfo << /Registry (Adobe) /Ordering (Japan1) /Supplement 4 >> /DW 1000 >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    `<< /Length ${Buffer.byteLength(stream, 'ascii')} >>\nstream\n${stream}endstream`,
  ]

  const header = '%PDF-1.4\n%âãÏÓ\n'
  const chunks = [header]
  const offsets = [0]
  let position = Buffer.byteLength(header, 'latin1')

  objects.forEach((object, index) => {
    offsets.push(position)
    const chunk = `${index + 1} 0 obj\n${object}\nendobj\n`
    chunks.push(chunk)
    position += Buffer.byteLength(chunk, 'latin1')
  })

  const xrefPosition = position
  const xref =
    `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` +
    offsets
      .slice(1)
      .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
      .join('')
  const trailer =
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n` +
    `startxref\n${xrefPosition}\n%%EOF\n`

  return Buffer.from(chunks.join('') + xref + trailer, 'latin1')
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient()
  const { id } = params

  try {
    const { user, error: userError } = await getCurrentUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select(
        'id,amount,transport_fee,extra_fee,invoice_number,status,due_date,created_at,updated_at,store_id,talent_id,contract_snapshot'
      )
      .eq('id', id)
      .single<InvoiceRow>()

    if (invError || !invoice) {
      return NextResponse.json({ error: 'invoice_not_found' }, { status: 404 })
    }

    const [{ data: storeOwner }, { data: talentOwner }] = await Promise.all([
      supabase.from('stores').select('id').eq('user_id', user.id).maybeSingle(),
      supabase.from('talents').select('id').eq('user_id', user.id).maybeSingle(),
    ])

    const authorized =
      storeOwner?.id === invoice.store_id || talentOwner?.id === invoice.talent_id

    if (!authorized) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const contractSnapshot =
      invoice.status === 'approved' ? readContractSnapshot(invoice.contract_snapshot) : null

    let pdfInvoice = invoice
    let storeName: string
    let storeAddress: string | null
    let talentName: string
    let billing: BillingRow
    let payout: PayoutRow

    if (contractSnapshot) {
      pdfInvoice = {
        ...invoice,
        amount: contractSnapshot.invoice.amount,
        transport_fee: contractSnapshot.invoice.transport_fee,
        extra_fee: contractSnapshot.invoice.extra_fee,
        invoice_number: contractSnapshot.invoice.invoice_number,
        due_date: contractSnapshot.invoice.due_date,
        updated_at: contractSnapshot.captured_at,
      }
      storeName = contractSnapshot.store_name
      storeAddress = contractSnapshot.store_address ?? null
      talentName = contractSnapshot.talent_name
      billing = contractSnapshot.billing ?? null
      payout = contractSnapshot.payout
    } else {
      const service = createServiceClient()
      const [{ data: store }, { data: talent }, { data: payoutRow }, billingResult] = await Promise.all([
        service
          .from('stores')
          .select('store_name,store_address')
          .eq('id', invoice.store_id)
          .maybeSingle(),
        service
          .from('talents')
          .select('stage_name,display_name,name')
          .eq('id', invoice.talent_id)
          .maybeSingle(),
        service
          .from('talent_payout_accounts')
          .select('bank_name,branch_name,account_type,account_number,account_holder')
          .eq('talent_id', invoice.talent_id)
          .maybeSingle(),
        (service as any)
          .from('talent_billing_profiles')
          .select('billing_name,billing_address,invoice_registration_number')
          .eq('talent_id', invoice.talent_id)
          .maybeSingle(),
      ])

      storeName = store?.store_name ?? '店舗名未設定'
      storeAddress = store?.store_address ?? null
      talentName =
        talent?.stage_name ?? talent?.display_name ?? talent?.name ?? '演者名未設定'
      billing = (billingResult?.data as BillingRow) ?? null
      payout = (payoutRow as PayoutRow) ?? null
    }

    const pdfBytes = buildInvoicePdf({
      invoice: pdfInvoice,
      storeName,
      storeAddress,
      talentName,
      billing,
      payout,
    })

    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.status === 'approved' ? 'contract-invoice' : 'estimate'}-${pdfInvoice.invoice_number}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (e) {
    console.error('[GET /invoices/:id/pdf]', e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
