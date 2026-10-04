import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText } from 'lucide-react'
import { getInvoiceStatusLabel, getPaymentStatusLabel } from '@/lib/invoices/status'

export interface SubmittedInvoice {
  id: string
  offer_id: string
  amount: number
  transport_fee: number | null
  extra_fee: number | null
  notes: string | null
  invoice_number: string
  due_date: string | null
  status: string
  payment_status: string | null
  created_at: string | null
}
function dateLabel(value: string | null, time = false) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'long', day: 'numeric', ...(time ? { hour: '2-digit', minute: '2-digit' } as const : {}) }).format(date)
}

export default function InvoiceSubmittedSummary({ invoice }: { invoice: SubmittedInvoice }) {
  const baseFee = Math.max(0, invoice.amount - (invoice.transport_fee ?? 0) - (invoice.extra_fee ?? 0))
  const submitted = invoice.status === 'submitted'
  return <main className="mx-auto w-full max-w-5xl space-y-4 px-3 py-4 text-[#0B1F3B] sm:px-5 sm:py-6 lg:px-0">
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 p-5 sm:gap-4 sm:p-7"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-[#C2410C]"><CheckCircle2 size={24} /></span><div className="min-w-0"><p className="text-xs font-bold text-[#C2410C]">{getInvoiceStatusLabel(invoice.status)}</p><h1 className="mt-1 text-xl font-black leading-relaxed tracking-tight sm:text-2xl">{submitted ? '見積書を提出しました' : '見積書の提出内容'}</h1><p className="mt-2 text-sm leading-7 text-slate-600">{submitted ? '店舗が内容を確認しています。見積が承認されると契約が成立します。' : '現在の状況と見積内容をご確認ください。'}</p></div></div>
      <div className="h-1 bg-gradient-to-r from-[#FF5A1F] to-[#FFC400]" />
    </section>
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="flex items-center gap-2 text-base font-bold"><FileText size={18} className="text-[#C2410C]" />見積情報</h2><dl className="mt-4 space-y-4 text-sm">
        <div><dt className="text-xs text-slate-500">管理番号</dt><dd className="mt-1 break-all font-semibold">{invoice.invoice_number}</dd></div>
        <div><dt className="text-xs text-slate-500">作成日時（日本時間）</dt><dd className="mt-1">{dateLabel(invoice.created_at,true)}</dd></div>
        {invoice.due_date && <div><dt className="text-xs text-slate-500">支払期限</dt><dd className="mt-1">{dateLabel(invoice.due_date)}</dd></div>}
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4"><span className="rounded-md bg-orange-50 px-2.5 py-1.5 text-xs font-semibold text-[#C2410C]">{getInvoiceStatusLabel(invoice.status)}</span><span className="rounded-md bg-slate-100 px-2.5 py-1.5 text-xs text-slate-600">{getPaymentStatusLabel(invoice.payment_status)}</span></div>
      </dl></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="text-base font-bold">金額内訳</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-slate-600">基本報酬</dt><dd className="font-semibold tabular-nums">¥{baseFee.toLocaleString('ja-JP')}</dd></div>{(invoice.transport_fee ?? 0) > 0 && <div className="flex justify-between gap-3"><dt className="text-slate-600">交通費</dt><dd className="font-semibold tabular-nums">¥{invoice.transport_fee!.toLocaleString('ja-JP')}</dd></div>}{(invoice.extra_fee ?? 0) > 0 && <div className="flex justify-between gap-3"><dt className="text-slate-600">追加料金</dt><dd className="font-semibold tabular-nums">¥{invoice.extra_fee!.toLocaleString('ja-JP')}</dd></div>}<div className="flex items-baseline justify-between gap-3 border-t border-slate-200 pt-4"><dt className="font-bold">合計</dt><dd className="text-2xl font-black tabular-nums sm:text-3xl">¥{invoice.amount.toLocaleString('ja-JP')}</dd></div></dl>{invoice.notes && <div className="mt-5 rounded-lg bg-slate-50 p-3"><h3 className="text-xs font-semibold text-slate-500">メモ</h3><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{invoice.notes}</p></div>}</section>
    </div>
    <div className="grid gap-2 sm:grid-cols-2"><Link href={`/talent/invoices/${invoice.id}`} className="flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#0B1F3B] px-4 py-3 text-sm font-bold text-white hover:bg-[#183859]">見積詳細を確認する<ArrowRight size={16} /></Link><Link href={`/talent/offers/${invoice.offer_id}`} className="flex min-h-12 items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold hover:bg-slate-50">案件詳細へ戻る<ArrowRight size={16} /></Link></div>
    <Link href="/talent/invoices" className="inline-flex min-h-11 items-center text-sm text-slate-600 underline underline-offset-4">見積・請求一覧へ</Link>
  </main>
}
