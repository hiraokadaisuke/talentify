import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PDFDocument, StandardFonts } from 'pdf-lib'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient()
  const { id } = params

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select(
        'id, amount, transport_fee, extra_fee, invoice_number, due_date, created_at, store_id, talent_id, talents:talent_id(bank_name, branch_name, account_type, account_number, account_holder)'
      )
      .eq('id', id)
      .single()
    if (invError || !invoice) {
      return NextResponse.json({ error: 'invoice_not_found' }, { status: 404 })
    }

    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    const { data: talent } = await supabase
      .from('talents')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    const authorized =
      (store && store.id === invoice.store_id) ||
      (talent && talent.id === invoice.talent_id)
    if (!authorized) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()
    const { height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontSize = 12
    const lineHeight = 20
    let y = height - 50
    const drawLine = (text: string) => {
      page.drawText(text, { x: 50, y, size: fontSize, font })
      y -= lineHeight
    }
    const blank = () => {
      y -= lineHeight
    }
    const toYen = (n: number) => `¥${n.toLocaleString('ja-JP')}`
    const formatDate = (d: string | null) =>
      d ? new Date(d).toLocaleDateString('ja-JP') : ''

    drawLine(`請求日: ${formatDate(invoice.created_at)}`)
    drawLine(`請求書番号: ${invoice.invoice_number ?? ''}`)
    drawLine(`支払期限: ${formatDate(invoice.due_date)}`)
    blank()
    const baseFee =
      invoice.amount - (invoice.transport_fee ?? 0) - (invoice.extra_fee ?? 0)
    drawLine(`基本報酬: ${toYen(baseFee)}`)
    drawLine(`交通費: ${toYen(invoice.transport_fee ?? 0)}`)
    drawLine(`追加料金: ${toYen(invoice.extra_fee ?? 0)}`)
    drawLine(`合計金額: ${toYen(invoice.amount)}`)
    blank()
    drawLine('振込先情報:')
    drawLine(`銀行名: ${invoice.talents?.bank_name ?? ''}`)
    drawLine(`支店名: ${invoice.talents?.branch_name ?? ''}`)
    drawLine(`口座種別: ${invoice.talents?.account_type ?? ''}`)
    drawLine(`口座番号: ${invoice.talents?.account_number ?? ''}`)
    drawLine(`口座名義: ${invoice.talents?.account_holder ?? ''}`)

    const pdfBytes = await pdfDoc.save()

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
      },
    })
  } catch (e) {
    console.error('[GET /invoices/:id/pdf]', e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

