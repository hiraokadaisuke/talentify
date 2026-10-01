import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  getPerformanceSnapshot,
  readContractSnapshot,
  type BillingSnapshot,
  type PayoutSnapshot,
  type PerformanceContractSnapshot,
} from '@/lib/invoices/contractSnapshot'

type BillingRow = BillingSnapshot
type PayoutRow = PayoutSnapshot

type CancellationRecord = {
  canceled_at: string
  canceled_by_role: 'store' | 'talent'
  cancel_reason: string
  cancellation_phase: 'pre_contract' | 'post_contract'
}

type InvoiceRow = {
  id: string
  amount: number
  transport_fee: number | null
  extra_fee: number | null
  notes: string | null
  invoice_number: string
  status: string | null
  due_date: string | null
  created_at: string | null
  updated_at: string | null
  store_id: string
  talent_id: string
  offer_id: string
  contract_snapshot: unknown
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
  performance: PerformanceContractSnapshot | null
  cancellation: CancellationRecord | null
}) {
  const {
    invoice,
    storeName,
    storeAddress,
    talentName,
    billing,
    payout,
    performance,
    cancellation,
  } = params

  const pageWidth = 595
  const pageHeight = 842
  const pages: string[][] = [[]]

  const addPage = () => {
    const page: string[] = []
    pages.push(page)
    return page
  }

  const jp = (page: string[], text: string, x: number, y: number, size = 11) => {
    page.push(
      `BT /FJ ${size} Tf 1 0 0 1 ${x} ${y} Tm <${toUtf16BeHex(text)}> Tj ET`
    )
  }
  const latin = (page: string[], text: string, x: number, y: number, size = 11) => {
    page.push(
      `BT /FL ${size} Tf 1 0 0 1 ${x} ${y} Tm (${toPdfAscii(text)}) Tj ET`
    )
  }
  const line = (
    page: string[],
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width = 0.6
  ) => {
    page.push(`q 0.72 G ${width} w ${x1} ${y1} m ${x2} ${y2} l S Q`)
  }
  const box = (page: string[], x: number, y: number, width: number, height: number) => {
    page.push(`q 0.96 g ${x} ${y} ${width} ${height} re f Q`)
    page.push(`q 0.72 G 0.6 w ${x} ${y} ${width} ${height} re S Q`)
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

  const formatDateTime = (value: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date)
  }

  const wrapText = (value: string | null | undefined, maxChars = 34) => {
    const normalized = (value ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
    if (!normalized) return ['なし']

    const lines: string[] = []
    for (const paragraph of normalized.split('\n')) {
      const chars = Array.from(paragraph)
      if (chars.length === 0) {
        lines.push('')
        continue
      }
      for (let i = 0; i < chars.length; i += maxChars) {
        lines.push(chars.slice(i, i + maxChars).join(''))
      }
    }
    return lines
  }

  const money = (value: number) => Math.max(0, value).toLocaleString('ja-JP')
  const baseFee = Math.max(
    0,
    invoice.amount - (invoice.transport_fee ?? 0) - (invoice.extra_fee ?? 0)
  )
  const isContracted = invoice.status === 'approved'
  const documentTitle = isContracted ? '取引締結書兼請求書' : '見積書'

  const first = pages[0]
  jp(first, documentTitle, isContracted ? 198 : 255, 790, isContracted ? 18 : 22)
  latin(first, invoice.invoice_number, 402, 794, 9)
  line(first, 50, 775, 545, 775, 1)

  jp(first, '請求先', 50, 742, 9)
  jp(first, storeName || '店舗名未設定', 50, 716, 15)
  if (storeAddress) jp(first, storeAddress, 50, 696, 8)

  jp(first, '請求元', 330, 742, 9)
  jp(first, billing?.billing_name || talentName || '演者名未設定', 330, 716, 15)
  if (billing?.billing_address) jp(first, billing.billing_address, 330, 696, 8)
  if (billing?.invoice_registration_number) {
    jp(first, '登録番号', 330, 678, 8)
    latin(first, billing.invoice_registration_number, 385, 678, 8)
  }

  box(first, 50, 635, 495, 54)
  jp(first, isContracted ? 'ご請求金額' : 'お見積金額', 66, 655, 11)
  latin(first, money(invoice.amount), 330, 653, 18)
  jp(first, '円', 482, 655, 11)

  jp(first, isContracted ? '締結・請求情報' : '見積情報', 50, 600, 13)
  line(first, 50, 590, 545, 590)
  jp(first, isContracted ? '締結日' : '見積作成日', 60, 566, 10)
  latin(first, formatDate(isContracted ? invoice.updated_at : invoice.created_at), 210, 566, 10)
  jp(first, isContracted ? '締結書兼請求書番号' : '管理番号', 60, 542, 10)
  latin(first, invoice.invoice_number, 210, 542, 10)
  jp(first, '支払期限', 60, 518, 10)
  latin(first, formatDate(invoice.due_date), 210, 518, 10)

  jp(first, '金額内訳', 50, 478, 13)
  line(first, 50, 468, 545, 468)
  jp(first, '基本報酬', 60, 444, 10)
  latin(first, money(baseFee), 420, 444, 10)
  jp(first, '円', 510, 444, 10)
  jp(first, '交通費', 60, 420, 10)
  latin(first, money(invoice.transport_fee ?? 0), 420, 420, 10)
  jp(first, '円', 510, 420, 10)
  jp(first, '追加料金', 60, 396, 10)
  latin(first, money(invoice.extra_fee ?? 0), 420, 396, 10)
  jp(first, '円', 510, 396, 10)
  line(first, 330, 384, 535, 384)
  jp(first, '合計', 330, 360, 11)
  latin(first, money(invoice.amount), 420, 360, 12)
  jp(first, '円', 510, 360, 10)

  if (isContracted && performance) {
    jp(first, '出演条件', 50, 320, 13)
    line(first, 50, 310, 545, 310)
    jp(first, '出演日', 60, 284, 10)
    latin(first, formatDate(performance.date), 210, 284, 10)
    jp(first, '出演時間', 60, 260, 10)
    jp(first, performance.time_range, 210, 260, 10)
    jp(first, '詳細', 60, 236, 10)
    jp(first, '案件内容・見積備考・振込先は次ページ以降に記載', 210, 236, 9)
  } else {
    jp(first, isContracted ? '振込先情報' : '確認事項', 50, 320, 13)
    line(first, 50, 310, 545, 310)

    if (!isContracted) {
      jp(first, '本見積はホール承認後に取引条件として確定します。', 60, 282, 10)
      if (invoice.notes) {
        jp(first, '見積備考', 60, 250, 10)
        const noteLines = wrapText(invoice.notes, 38).slice(0, 4)
        noteLines.forEach((noteLine, index) => {
          jp(first, noteLine, 80, 228 - index * 18, 9)
        })
      }
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
        jp(first, label, 60, y, 10)
        if (ascii) latin(first, value, 210, y, 10)
        else jp(first, value, 210, y, 10)
        y -= 24
      }
    } else {
      jp(first, '振込先情報が登録されていません', 60, 282, 10)
    }
  }

  jp(first, 'Talentify', 50, 70, 9)
  latin(first, invoice.invoice_number, 430, 70, 8)

  if (isContracted && performance) {
    let detailPage = addPage()
    let y = 790

    const startDetailPage = (continued = false) => {
      if (detailPage.length > 0) detailPage = addPage()
      y = 790
      jp(detailPage, continued ? '契約条件（続き）' : '契約条件詳細', 50, y, 18)
      latin(detailPage, invoice.invoice_number, 402, y + 4, 9)
      line(detailPage, 50, y - 15, 545, y - 15, 1)
      y -= 48
    }

    const ensureSpace = (needed: number) => {
      if (y - needed < 82) {
        startDetailPage(true)
      }
    }

    const drawSimpleRow = (label: string, value: string, ascii = false) => {
      ensureSpace(28)
      jp(detailPage, label, 60, y, 10)
      if (ascii) latin(detailPage, value, 210, y, 10)
      else jp(detailPage, value, 210, y, 10)
      y -= 26
    }

    const drawWrappedSection = (label: string, value: string | null) => {
      const lines = wrapText(value, 36)
      ensureSpace(30)
      jp(detailPage, label, 60, y, 11)
      y -= 24

      for (const textLine of lines) {
        if (y - 20 < 82) {
          startDetailPage(true)
          jp(detailPage, `${label}（続き）`, 60, y, 11)
          y -= 24
        }
        jp(detailPage, textLine || ' ', 75, y, 9)
        y -= 18
      }
      y -= 10
    }

    startDetailPage(false)

    jp(detailPage, '出演条件', 50, y, 13)
    line(detailPage, 50, y - 10, 545, y - 10)
    y -= 36

    drawSimpleRow('出演日', formatDate(performance.date), true)
    drawSimpleRow('開始時刻', performance.start_time, true)
    drawSimpleRow('終了時刻', performance.end_time, true)
    if (performance.event_name) {
      drawWrappedSection('案件名', performance.event_name)
    }
    drawWrappedSection('案件内容（オファー時）', performance.offer_message)
    drawWrappedSection('見積備考', invoice.notes)

    if (cancellation) {
      ensureSpace(160)
      jp(detailPage, 'キャンセル記録', 50, y, 13)
      line(detailPage, 50, y - 10, 545, y - 10)
      y -= 36
      drawSimpleRow(
        '区分',
        cancellation.cancellation_phase === 'post_contract' ? '契約成立後' : '契約成立前'
      )
      drawSimpleRow(
        '実行者',
        cancellation.canceled_by_role === 'talent' ? '演者' : '店舗'
      )
      drawSimpleRow('キャンセル日時', formatDateTime(cancellation.canceled_at))
      drawWrappedSection('キャンセル理由', cancellation.cancel_reason)
    }

    ensureSpace(170)
    jp(detailPage, '振込先情報', 50, y, 13)
    line(detailPage, 50, y - 10, 545, y - 10)
    y -= 36

    if (payout) {
      const payoutRows: Array<[string, string, boolean]> = [
        ['銀行名', payout.bank_name ?? '-', false],
        ['支店名', payout.branch_name ?? '-', false],
        ['口座種別', payout.account_type ?? '-', false],
        ['口座番号', payout.account_number ?? '-', true],
        ['口座名義', payout.account_holder ?? '-', false],
      ]
      for (const [label, value, ascii] of payoutRows) {
        drawSimpleRow(label, value, ascii)
      }
    } else {
      jp(detailPage, '振込先情報が登録されていません', 60, y, 10)
      y -= 26
    }

    for (let index = 1; index < pages.length; index += 1) {
      const page = pages[index]
      jp(page, 'Talentify', 50, 42, 9)
      latin(page, invoice.invoice_number, 430, 42, 8)
      latin(page, `${index + 1}/${pages.length}`, 505, 42, 8)
    }
    latin(first, `1/${pages.length}`, 505, 70, 8)
  }

  const pageObjectIds = pages.map((_, index) => 6 + index * 2)
  const contentObjectIds = pages.map((_, index) => 7 + index * 2)

  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${pageObjectIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`,
    '<< /Type /Font /Subtype /Type0 /BaseFont /HeiseiKakuGo-W5 /Encoding /UniJIS-UCS2-H /DescendantFonts [4 0 R] >>',
    '<< /Type /Font /Subtype /CIDFontType0 /BaseFont /HeiseiKakuGo-W5 /CIDSystemInfo << /Registry (Adobe) /Ordering (Japan1) /Supplement 4 >> /DW 1000 >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  ]

  pages.forEach((page, index) => {
    const stream = page.join('\n') + '\n'
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /FJ 3 0 R /FL 5 0 R >> >> /Contents ${contentObjectIds[index]} 0 R >>`,
      `<< /Length ${Buffer.byteLength(stream, 'ascii')} >>\nstream\n${stream}endstream`
    )
  })

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
      .map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`)
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
        'id,amount,transport_fee,extra_fee,notes,invoice_number,status,due_date,created_at,updated_at,store_id,talent_id,offer_id,contract_snapshot'
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

    const service = createServiceClient()
    const contractSnapshot =
      invoice.status === 'approved' ? readContractSnapshot(invoice.contract_snapshot) : null

    const { data: canceledOffer } =
      invoice.status === 'approved'
        ? await service
            .from('offers')
            .select('status,canceled_at,canceled_by_role,cancel_reason,cancellation_phase')
            .eq('id', invoice.offer_id)
            .maybeSingle()
        : { data: null }

    const cancellation: CancellationRecord | null =
      canceledOffer?.status === 'canceled' &&
      canceledOffer.canceled_at &&
      (canceledOffer.canceled_by_role === 'store' || canceledOffer.canceled_by_role === 'talent') &&
      canceledOffer.cancel_reason &&
      (canceledOffer.cancellation_phase === 'pre_contract' ||
        canceledOffer.cancellation_phase === 'post_contract')
        ? {
            canceled_at: canceledOffer.canceled_at,
            canceled_by_role: canceledOffer.canceled_by_role,
            cancel_reason: canceledOffer.cancel_reason,
            cancellation_phase: canceledOffer.cancellation_phase,
          }
        : null

    let pdfInvoice = invoice
    let storeName: string
    let storeAddress: string | null
    let talentName: string
    let billing: BillingRow
    let payout: PayoutRow
    let performance: PerformanceContractSnapshot | null = null

    if (contractSnapshot) {
      pdfInvoice = {
        ...invoice,
        amount: contractSnapshot.invoice.amount,
        transport_fee: contractSnapshot.invoice.transport_fee,
        extra_fee: contractSnapshot.invoice.extra_fee,
        invoice_number: contractSnapshot.invoice.invoice_number,
        due_date: contractSnapshot.invoice.due_date,
        notes: contractSnapshot.invoice.notes,
        updated_at: contractSnapshot.captured_at,
      }
      storeName = contractSnapshot.store_name
      storeAddress = contractSnapshot.store_address ?? null
      talentName = contractSnapshot.talent_name
      billing = contractSnapshot.billing ?? null
      payout = contractSnapshot.payout
      performance = getPerformanceSnapshot(contractSnapshot)
    } else {
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
      performance,
      cancellation,
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
