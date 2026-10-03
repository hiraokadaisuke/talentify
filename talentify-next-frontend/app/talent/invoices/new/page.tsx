'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  CalendarDays,
  Check,
  FileText,
  JapaneseYen,
  Store,
  Upload,
} from 'lucide-react'
import { getInvoiceStatusLabel, isPaymentCompleted } from '@/lib/invoices/status'

type CreationMode = 'system' | 'pdf'

function moneyInputClass() {
  return 'min-h-12 rounded-xl border-slate-300 bg-white pl-8 pr-10 text-base font-semibold shadow-none focus-visible:border-orange-300 focus-visible:ring-orange-100'
}

export default function TalentInvoiceNewPage() {
  const searchParams = useSearchParams()
  const offerId = searchParams.get('offerId')
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [offer, setOffer] = useState<any | null>(null)
  const [invoice, setInvoice] = useState<any | null>(null)
  const [creationMode, setCreationMode] = useState<CreationMode>('system')

  const [baseFee, setBaseFee] = useState('')
  const [transportFee, setTransportFee] = useState('')
  const [extraFee, setExtraFee] = useState('')
  const [memo, setMemo] = useState('')
  const [dueDate, setDueDate] = useState('')

  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfAmount, setPdfAmount] = useState('')
  const [pdfMemo, setPdfMemo] = useState('')

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      if (!offerId) return

      const [{ data: offerData }, { data: invData }] = await Promise.all([
        supabase
          .from('offers')
          .select(
            `
            id, date, reward, message,
            store:stores!offers_store_id_fkey(id, store_name)
          `
          )
          .eq('id', offerId)
          .single(),
        supabase
          .from('invoices')
          .select('id, amount, transport_fee, extra_fee, notes, status, payment_status, invoice_url, due_date')
          .eq('offer_id', offerId)
          .maybeSingle(),
      ])

      if (offerData) {
        setOffer(offerData)
      }

      if (invData) {
        if (invData.status && invData.status !== 'draft') {
          toast.info(
            invData.status === 'submitted'
              ? 'この見積書はすでに店舗へ提出済みです'
              : 'この見積書はすでに進行中のため編集できません'
          )
          router.replace(`/talent/invoices/${invData.id}`)
          return
        }

        const savedTransportFee = Number(invData.transport_fee ?? 0)
        const savedExtraFee = Number(invData.extra_fee ?? 0)
        const savedAmount = Number(invData.amount ?? 0)

        setInvoice(invData)
        setBaseFee(String(Math.max(0, savedAmount - savedTransportFee - savedExtraFee)))
        setTransportFee(savedTransportFee ? String(savedTransportFee) : '')
        setExtraFee(savedExtraFee ? String(savedExtraFee) : '')
        setMemo(invData.notes ?? '')
        setPdfAmount(savedAmount ? String(savedAmount) : '')
        setPdfMemo(invData.notes ?? '')
        setDueDate(invData.due_date ?? '')
        setCreationMode(invData.invoice_url ? 'pdf' : 'system')
      } else if (offerData?.reward) {
        setBaseFee(String(offerData.reward))
      }
    }

    void init()
  }, [offerId, supabase])

  const total =
    Number(baseFee || 0) +
    Number(transportFee || 0) +
    Number(extraFee || 0)

  const statusLabel = () => {
    if (isPaymentCompleted(invoice?.payment_status)) return '支払済み'
    return getInvoiceStatusLabel(invoice?.status)
  }

  const storeDisplayName = offer?.store?.store_name ?? ''

  const currentStep = () => {
    if (isPaymentCompleted(invoice?.payment_status)) return 2
    return invoice?.status === 'submitted' || invoice?.status === 'approved' ? 1 : 0
  }

  const upsertSystemDraft = async () => {
    if (!offerId) return null

    let id = invoice?.id
    const payload = {
      amount: total,
      transport_fee: Number(transportFee || 0),
      extra_fee: Number(extraFee || 0),
      notes: memo.trim() || null,
      due_date: dueDate || null,
    }

    if (id) {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('patch failed')
    } else {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offerId,
          ...payload,
        }),
      })
      if (!res.ok) throw new Error('post failed')
      const data = await res.json()
      id = data.id
    }

    if (!id) throw new Error('id missing')

    setInvoice((prev: any) => ({
      ...(prev ?? {}),
      id,
      ...payload,
      status: prev?.status ?? 'draft',
      payment_status: prev?.payment_status ?? null,
    }))

    return id as string
  }

  const saveDraft = async () => {
    if (!offerId || total <= 0) return
    setLoading(true)
    try {
      await upsertSystemDraft()
      toast.success('見積書の下書きを保存しました')
    } catch {
      toast.error('下書き保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const submitSystem = async () => {
    if (!offerId) return
    if (total <= 0) {
      toast.error('見積金額を入力してください')
      return
    }

    setLoading(true)
    try {
      const id = await upsertSystemDraft()
      if (!id) throw new Error('id missing')

      const submitRes = await fetch(`/api/invoices/${id}/submit`, { method: 'POST' })
      if (!submitRes.ok) throw new Error('submit failed')

      router.replace(`/talent/invoices/${id}/submitted`)
    } catch {
      toast.error('見積書の提出に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const submitPdf = async () => {
    if (!offerId || !pdfFile) {
      toast.error('提出するPDFを選択してください')
      return
    }

    const amount = Number(pdfAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('見積合計金額を入力してください')
      return
    }

    setLoading(true)
    let id = invoice?.id

    try {
      const payload = {
        amount,
        transport_fee: 0,
        extra_fee: 0,
        notes: pdfMemo.trim() || null,
        due_date: dueDate || null,
      }

      if (id) {
        const res = await fetch(`/api/invoices/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('patch failed')
      } else {
        const res = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offer_id: offerId,
            ...payload,
          }),
        })
        if (!res.ok) throw new Error('post failed')
        const data = await res.json()
        id = data.id
      }

      if (!id) throw new Error('id missing')

      const formData = new FormData()
      formData.append('file', pdfFile)

      const uploadRes = await fetch(`/api/invoices/${id}/attachment`, {
        method: 'POST',
        body: formData,
      })
      if (!uploadRes.ok) throw new Error('upload failed')

      const uploadData = await uploadRes.json()

      setInvoice((prev: any) => ({
        ...(prev ?? {}),
        id,
        invoice_url: uploadData.path,
        ...payload,
        status: prev?.status ?? 'draft',
        payment_status: prev?.payment_status ?? null,
      }))

      const submitRes = await fetch(`/api/invoices/${id}/submit`, { method: 'POST' })
      if (!submitRes.ok) throw new Error('submit failed')

      router.replace(`/talent/invoices/${id}/submitted`)
    } catch {
      toast.error('見積書の提出に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (creationMode === 'system') {
      await submitSystem()
      return
    }
    await submitPdf()
  }

  const formattedDate = offer?.date
    ? format(new Date(offer.date), 'yyyy/MM/dd (EEE)', { locale: ja })
    : '未設定'

  const steps = ['見積作成', 'ホール確認', '締結・請求']
  const activeStep = currentStep()

  return (
    <main className="bg-slate-50/60 px-3 py-4 sm:px-5 sm:py-6 lg:bg-transparent lg:px-0 lg:py-0">
      <div className="mx-auto grid min-w-0 max-w-[1180px] grid-cols-1 lg:max-w-[1280px] gap-4 sm:gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)] lg:col-span-2">
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-[11px] font-black tracking-[0.16em] text-[#C2410C]">CREATE ESTIMATE</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">見積書を作成</h1>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                条件と金額を確認して、店舗へ見積書を提出します。
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span>現在の状態</span>
              <Badge variant="secondary" className="rounded-full px-2.5 py-1">
                {statusLabel()}
              </Badge>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]" />
        </section>

        <Card className="h-fit rounded-2xl border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,.05)] lg:sticky lg:top-6">
          <CardHeader className="border-b border-slate-100 p-4">
            <CardTitle className="text-base font-black text-slate-950">案件情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-50 text-[#C2410C]">
                  <Store className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-400">店舗</p>
                  <p className="truncate text-sm font-black text-slate-900">
                    {storeDisplayName || '店舗未設定'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-50 text-[#C2410C]">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] font-bold text-slate-400">来店予定日</p>
                  <p className="text-sm font-black text-slate-900">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-50 text-[#C2410C]">
                  <JapaneseYen className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] font-bold text-slate-400">オファー時の予定報酬</p>
                  <p className="text-sm font-black text-slate-900">
                    {offer?.reward != null ? `¥${Number(offer.reward).toLocaleString()}` : '未設定'}
                  </p>
                </div>
              </div>
            </div>

            {offer?.message && (
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="text-[11px] font-bold text-slate-400">出演内容・相談事項</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {offer.message}
                </p>
              </div>
            )}

            <div className="border-t border-slate-100 pt-4">
              <p className="mb-3 text-[11px] font-black tracking-wide text-slate-400">進行状況</p>
              <div className="grid grid-cols-3 gap-1">
                {steps.map((step, index) => {
                  const completed = index < activeStep
                  const current = index === activeStep
                  return (
                    <div key={step} className="min-w-0 text-center">
                      <div className="flex items-center">
                        <span
                          className={`h-px flex-1 ${index === 0 ? 'bg-transparent' : index <= activeStep ? 'bg-orange-300' : 'bg-slate-200'}`}
                        />
                        <span
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] font-black ${
                            completed
                              ? 'border-orange-500 bg-orange-500 text-white'
                              : current
                                ? 'border-orange-400 bg-orange-50 text-[#C2410C]'
                                : 'border-slate-200 bg-white text-slate-400'
                          }`}
                        >
                          {completed ? <Check className="h-3.5 w-3.5" /> : index + 1}
                        </span>
                        <span
                          className={`h-px flex-1 ${index === steps.length - 1 ? 'bg-transparent' : index < activeStep ? 'bg-orange-300' : 'bg-slate-200'}`}
                        />
                      </div>
                      <p className={`mt-1.5 text-[10px] font-bold ${current ? 'text-[#C2410C]' : 'text-slate-500'}`}>
                        {step}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,.05)]">
          <CardHeader className="border-b border-slate-100 p-4 sm:p-5">
            <CardTitle className="text-xl font-black text-slate-950">見積内容</CardTitle>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              来店ナビで作成するか、作成済みのPDFを提出できます。
            </p>
          </CardHeader>

          <CardContent className="p-4 sm:p-5">
            <form onSubmit={handleSubmit} className="space-y-6">
              <section className="space-y-3">
                <div>
                  <p className="text-sm font-black text-slate-900">見積書の作り方</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    普段は「来店ナビで作成」がおすすめです。すでに見積書がある場合だけPDFを選んでください。
                  </p>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setCreationMode('system')}
                    aria-pressed={creationMode === 'system'}
                    className={`relative flex min-h-[88px] items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
                      creationMode === 'system'
                        ? 'border-orange-300 bg-orange-50/70 ring-2 ring-orange-100'
                        : 'border-slate-200 bg-white hover:border-orange-200'
                    }`}
                  >
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                      creationMode === 'system' ? 'bg-[#FF5A1F] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <FileText className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-slate-950">来店ナビで作成</span>
                        <span className="rounded-full bg-[#0B1F3B] px-2 py-0.5 text-[9px] font-black text-white">
                          おすすめ
                        </span>
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        金額内訳を入力すると見積書を自動作成
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreationMode('pdf')}
                    aria-pressed={creationMode === 'pdf'}
                    className={`flex min-h-[88px] items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
                      creationMode === 'pdf'
                        ? 'border-orange-300 bg-orange-50/70 ring-2 ring-orange-100'
                        : 'border-slate-200 bg-white hover:border-orange-200'
                    }`}
                  >
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                      creationMode === 'pdf' ? 'bg-[#FF5A1F] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Upload className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="text-sm font-black text-slate-950">PDFを提出</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        手元で作成済みの見積書をそのまま提出
                      </span>
                    </span>
                  </button>
                </div>
              </section>

              {creationMode === 'system' ? (
                <section className="space-y-4 border-t border-slate-100 pt-5">
                  <div>
                    <h2 className="text-sm font-black text-slate-900">金額内訳</h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      オファー時の予定報酬がある場合は、基本報酬に自動で入っています。必要に応じて変更してください。
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { label: '基本報酬', value: baseFee, setter: setBaseFee },
                      { label: '交通費', value: transportFee, setter: setTransportFee },
                      { label: '追加費用', value: extraFee, setter: setExtraFee },
                    ].map(({ label, value, setter }) => (
                      <div key={label}>
                        <label className="mb-1.5 block text-sm font-bold text-slate-800">{label}</label>
                        <div className="relative">
                          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-bold text-slate-400">¥</span>
                          <Input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            step="1000"
                            value={value}
                            onChange={event => setter(event.target.value)}
                            className={moneyInputClass()}
                            placeholder="0"
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-bold text-slate-400">円</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-800">備考・条件 <span className="font-normal text-slate-400">（任意）</span></label>
                    <Textarea
                      value={memo}
                      onChange={event => setMemo(event.target.value)}
                      rows={3}
                      className="rounded-xl border-slate-300 shadow-none focus-visible:border-orange-300 focus-visible:ring-orange-100"
                      placeholder="例：交通費は実費、延長時は1時間○○円 など"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#0B1F3B] px-4 py-4 text-white">
                    <div>
                      <p className="text-[10px] font-black tracking-[0.14em] text-white/55">ESTIMATE TOTAL</p>
                      <p className="mt-1 text-sm font-bold text-white/75">見積合計</p>
                    </div>
                    <p className="text-2xl font-black tracking-tight sm:text-3xl">
                      ¥{total.toLocaleString()}
                    </p>
                  </div>
                </section>
              ) : (
                <section className="space-y-4 border-t border-slate-100 pt-5">
                  <div>
                    <h2 className="text-sm font-black text-slate-900">PDF見積書</h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      PDFの内容と、来店ナビ上で管理する見積合計金額を入力してください。
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-800">見積合計金額</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-bold text-slate-400">¥</span>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        step="1000"
                        value={pdfAmount}
                        onChange={event => setPdfAmount(event.target.value)}
                        className={moneyInputClass()}
                        placeholder="0"
                        required
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-bold text-slate-400">円</span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">
                      店舗側の確認・支払い管理に使用します。
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-800">見積書PDF</label>
                    <input
                      id="estimate-pdf"
                      type="file"
                      accept="application/pdf"
                      className="sr-only"
                      onChange={event => setPdfFile(event.target.files?.[0] ?? null)}
                    />
                    <label
                      htmlFor="estimate-pdf"
                      className="flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 transition hover:border-orange-300 hover:bg-orange-50/40"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-slate-600 shadow-sm">
                          <Upload className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-bold text-slate-800">
                            {pdfFile ? 'PDFを選び直す' : 'PDFを選択'}
                          </span>
                          <span className="block truncate text-xs text-slate-500">
                            {pdfFile?.name ?? 'PDFのみ・10MBまで'}
                          </span>
                        </span>
                      </span>
                    </label>
                    <p className="mt-1.5 text-xs text-slate-500">
                      ファイルは非公開で保存され、案件の店舗と演者のみ確認できます。
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-800">備考 <span className="font-normal text-slate-400">（任意）</span></label>
                    <Textarea
                      value={pdfMemo}
                      onChange={event => setPdfMemo(event.target.value)}
                      rows={3}
                      className="rounded-xl border-slate-300 shadow-none focus-visible:border-orange-300 focus-visible:ring-orange-100"
                      placeholder="PDFに補足したい内容があれば入力してください"
                    />
                  </div>
                </section>
              )}

              <section className="space-y-3 border-t border-slate-100 pt-5">
                <div>
                  <h2 className="text-sm font-black text-slate-900">支払条件</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    支払期限は固定しません。店舗と取り決めがある場合だけ設定してください。
                  </p>
                </div>
                <div className="max-w-sm">
                  <label className="mb-1.5 block text-sm font-bold text-slate-800">
                    支払期限 <span className="font-normal text-slate-400">（任意）</span>
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={event => setDueDate(event.target.value)}
                    className="min-h-12 rounded-xl border-slate-300 bg-white shadow-none focus-visible:border-orange-300 focus-visible:ring-orange-100"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    未設定の場合は、見積書・締結書に期限を固定表示しません。
                  </p>
                </div>
              </section>

              <section className="border-t border-slate-100 pt-5">
                <p className="mb-3 text-xs leading-5 text-slate-500">
                  提出後、店舗が見積内容を確認します。条件の変更が必要な場合はメッセージで調整できます。
                </p>
                {creationMode === 'system' ? (
                  <div className="grid grid-cols-2 gap-2.5 sm:flex sm:justify-end">
                    <Button
                      type="button"
                      onClick={() => void saveDraft()}
                      disabled={loading || total <= 0}
                      variant="outline"
                      className="min-h-11 rounded-xl border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-50"
                    >
                      下書き保存
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || total <= 0}
                      className="min-h-11 rounded-xl bg-[#FF5A1F] font-bold text-white hover:bg-[#E94F18]"
                    >
                      {loading ? '処理中...' : '店舗へ提出'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex sm:justify-end">
                    <Button
                      type="submit"
                      disabled={loading || !pdfFile || Number(pdfAmount) <= 0}
                      className="min-h-11 w-full rounded-xl bg-[#FF5A1F] font-bold text-white hover:bg-[#E94F18] sm:w-auto"
                    >
                      {loading ? '処理中...' : '店舗へ提出'}
                    </Button>
                  </div>
                )}
              </section>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
