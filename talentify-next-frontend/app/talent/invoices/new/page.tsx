'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { addMonths, endOfMonth, format, parseISO, setDate } from 'date-fns'
import { getInvoiceStatusLabel, isPaymentCompleted } from '@/lib/invoices/status'

const dueDateOptions = [
  { value: 'none', label: '設定しない' },
  { value: 'next_month_end', label: '来店月末締め＋翌月末払い' },
  { value: 'next_month_20', label: '来店月末締め＋翌月20日払い' },
] as const

type DueDateOptionValue = (typeof dueDateOptions)[number]['value']
type DueDatePattern = DueDateOptionValue | 'custom'

const computeDueDateFromPattern = (pattern: DueDateOptionValue, offerDateStr: string) => {
  const baseDate = parseISO(offerDateStr)
  switch (pattern) {
    case 'next_month_end':
      return format(endOfMonth(addMonths(baseDate, 1)), 'yyyy-MM-dd')
    case 'next_month_20':
      return format(setDate(addMonths(baseDate, 1), 20), 'yyyy-MM-dd')
    default:
      return ''
  }
}
import { ja } from 'date-fns/locale'
import { toast } from 'sonner'

export default function TalentInvoiceNewPage() {
  const searchParams = useSearchParams()
  const offerId = searchParams.get('offerId')
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [offer, setOffer] = useState<any | null>(null)
  const [invoice, setInvoice] = useState<any | null>(null)

  const [baseFee, setBaseFee] = useState('')
  const [transportFee, setTransportFee] = useState('')
  const [extraFee, setExtraFee] = useState('')
  const [memo, setMemo] = useState('')

  const [dueDatePattern, setDueDatePattern] = useState<DueDatePattern>('next_month_end')
  const [dueDate, setDueDate] = useState('')
  const [dueDateInitialized, setDueDateInitialized] = useState(false)

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
      if (offerData) setOffer(offerData)
      if (invData) {
        const savedTransportFee = invData.transport_fee ?? 0
        const savedExtraFee = invData.extra_fee ?? 0
        setInvoice(invData)
        setBaseFee(
          String((invData.amount ?? 0) - savedTransportFee - savedExtraFee)
        )
        setTransportFee(String(savedTransportFee))
        setExtraFee(String(savedExtraFee))
        setMemo(invData.notes ?? '')
        setPdfAmount(String(invData.amount ?? ''))
        setPdfMemo(invData.notes ?? '')
        setDueDate(invData.due_date ?? '')
        if (!invData.due_date) {
          setDueDatePattern('none')
        }
      }
    }
    init()
  }, [offerId, supabase])

  useEffect(() => {
    if (dueDateInitialized) return
    if (!offer?.date) return

    if (invoice?.due_date) {
      const normalized = format(parseISO(invoice.due_date), 'yyyy-MM-dd')
      const matched = dueDateOptions
        .filter(option => option.value !== 'none')
        .find(
          option =>
            computeDueDateFromPattern(option.value, offer.date) === normalized,
        )
      if (matched) {
        setDueDatePattern(matched.value)
        setDueDate(normalized)
      } else {
        setDueDatePattern('custom')
        setDueDate(normalized)
      }
    }
    setDueDateInitialized(true)
  }, [dueDateInitialized, invoice?.due_date, offer?.date])

  useEffect(() => {
    if (!offer?.date) return
    if (dueDatePattern === 'custom') return
    if (dueDatePattern === 'none') {
      setDueDate('')
      return
    }
    const computed = computeDueDateFromPattern(dueDatePattern, offer.date)
    setDueDate(computed)
  }, [dueDatePattern, offer?.date])

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

  const saveDraft = async () => {
    if (!offerId) return
    setLoading(true)
    let id = invoice?.id
    try {
      if (id) {
        const res = await fetch(`/api/invoices/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            transport_fee: Number(transportFee || 0),
            extra_fee: Number(extraFee || 0),
            notes: memo.trim() || null,
            due_date: dueDate || null,
          }),
        })
        if (!res.ok) throw new Error('patch failed')
      } else {
        const res = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offer_id: offerId,
            amount: total,
            transport_fee: Number(transportFee || 0),
            extra_fee: Number(extraFee || 0),
            notes: memo.trim() || null,
            due_date: dueDate || null,
          }),
        })
        if (!res.ok) throw new Error('post failed')
        const data = await res.json()
        id = data.id
      }
      if (!id) throw new Error('id missing')
      setInvoice(prev => {
        const next = {
          ...(prev ?? {}),
          id,
          amount: total,
          transport_fee: Number(transportFee || 0),
          extra_fee: Number(extraFee || 0),
          notes: memo.trim() || null,
          due_date: dueDate || null,
        }
        if (!next.status) next.status = 'draft'
        if (next.payment_status === undefined) next.payment_status = null
        return next
      })
      toast.success('見積書の下書きを保存しました')
    } catch (e) {
      toast.error('下書き保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const submitSystem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offerId) return
    setLoading(true)
    let id = invoice?.id
    try {
      if (id) {
        const res = await fetch(`/api/invoices/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            transport_fee: Number(transportFee || 0),
            extra_fee: Number(extraFee || 0),
            notes: memo.trim() || null,
            due_date: dueDate || null,
          }),
        })
        if (!res.ok) throw new Error('patch failed')
      } else {
        const res = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offer_id: offerId,
            amount: total,
            transport_fee: Number(transportFee || 0),
            extra_fee: Number(extraFee || 0),
            notes: memo.trim() || null,
            due_date: dueDate || null,
          }),
        })
        if (!res.ok) throw new Error('post failed')
        const data = await res.json()
        id = data.id
      }
      if (!id) throw new Error('id missing')
      setInvoice(prev => {
        const next = {
          ...(prev ?? {}),
          id,
          amount: total,
          transport_fee: Number(transportFee || 0),
          extra_fee: Number(extraFee || 0),
          notes: memo.trim() || null,
          due_date: dueDate || null,
        }
        if (!next.status) next.status = 'draft'
        if (next.payment_status === undefined) next.payment_status = null
        return next
      })
      const submitRes = await fetch(`/api/invoices/${id}/submit`, { method: 'POST' })
      if (!submitRes.ok) throw new Error('submit failed')
      router.push(`/talent/invoices/${id}/submitted`)
    } catch (e) {
      toast.error('見積書の提出に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const submitPdf = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offerId || !pdfFile) return

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

      setInvoice(prev => {
        const next = {
          ...(prev ?? {}),
          id,
          invoice_url: uploadData.path,
          amount,
          transport_fee: 0,
          extra_fee: 0,
          notes: pdfMemo.trim() || null,
          due_date: dueDate || null,
        }
        if (!next.status) next.status = 'draft'
        if (next.payment_status === undefined) next.payment_status = null
        return next
      })

      const submitRes = await fetch(`/api/invoices/${id}/submit`, { method: 'POST' })
      if (!submitRes.ok) throw new Error('submit failed')
      router.push(`/talent/invoices/${id}/submitted`)
    } catch (e) {
      toast.error('見積書の提出に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const formattedDate = offer?.date
    ? format(new Date(offer.date), 'yyyy/MM/dd (EEE)', { locale: ja })
    : ''

  const steps = ['見積作成', 'ホール確認', '締結・請求']

  const dueDateMessage = (() => {
    if (dueDate) {
      try {
        const formatted = format(parseISO(dueDate), 'yyyy/MM/dd (EEE)', {
          locale: ja,
        })
        return `支払期限: ${formatted}`
      } catch {
        return `支払期限: ${dueDate}`
      }
    }
    if (dueDatePattern === 'none') {
      return '支払期限は設定されていません'
    }
    if (!offer?.date) {
      return '出演日情報がないため支払期限を計算できません'
    }
    return '支払期限は設定されていません'
  })()

  return (
    <main className="p-3 sm:p-5 lg:p-6">
      <div className="mx-auto grid min-w-0 max-w-[1200px] grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[420px,1fr]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
          <h1 className="text-xl font-bold">見積書を作成</h1>
          <div className="flex items-center gap-2 text-sm">
            <span>現在の状態:</span>
            <Badge variant="secondary">{statusLabel()}</Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>オファー概要</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div>
                店舗名:{' '}
                {storeDisplayName}
              </div>
              <div>出演日: {formattedDate}</div>
              <div>予定報酬(目安): ¥{offer?.reward?.toLocaleString?.() ?? ''}</div>
              <div className="whitespace-pre-wrap">出演内容: {offer?.message}</div>
            </div>
            <div className="border-t pt-4">
              <h2 className="mb-2 text-sm font-medium">ステータス履歴</h2>
              <ul className="space-y-2 text-sm">
                {steps.map((s, i) => (
                  <li key={s} className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        i <= currentStep() ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>見積書</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium">支払期限パターン</label>
                <select
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={dueDatePattern}
                  onChange={e => {
                    const value = e.target.value as DueDatePattern
                    if (value === 'custom') return
                    setDueDatePattern(value)
                  }}
                >
                  {dueDateOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  {dueDatePattern === 'custom' && (
                    <option value="custom" disabled>
                      その他（既存の支払期限を維持）
                    </option>
                  )}
                </select>
                <p className="mt-2 text-sm text-muted-foreground">{dueDateMessage}</p>
              </div>
              <Tabs defaultValue="system" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="system">システムで作成</TabsTrigger>
                  <TabsTrigger value="pdf">PDFをアップロード</TabsTrigger>
                </TabsList>
                <TabsContent value="system">
                  <form onSubmit={submitSystem} className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm">基本報酬</label>
                      <Input
                        type="number"
                        value={baseFee}
                        onChange={e => setBaseFee(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm">交通費</label>
                      <Input
                        type="number"
                        value={transportFee}
                        onChange={e => setTransportFee(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm">延長・追加費用</label>
                      <Input
                        type="number"
                        value={extraFee}
                        onChange={e => setExtraFee(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm">その他メモ</label>
                      <Textarea
                        value={memo}
                        onChange={e => setMemo(e.target.value)}
                      />
                    </div>
                    <div className="text-2xl font-bold text-right">
                      合計: ¥{total.toLocaleString()}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        onClick={saveDraft}
                        disabled={loading}
                        variant="outline"
                      >
                        下書き保存
                      </Button>
                      <Button type="submit" disabled={loading}>
                        提出する
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                <TabsContent value="pdf">
                  <form onSubmit={submitPdf} className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm">見積合計金額</label>
                      <Input
                        type="number"
                        min="1"
                        value={pdfAmount}
                        onChange={e => setPdfAmount(e.target.value)}
                        required
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        取引・支払い管理に使用する合計金額です。
                      </p>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm">PDFファイル</label>
                      <Input
                        type="file"
                        accept="application/pdf"
                        onChange={e => setPdfFile(e.target.files?.[0] ?? null)}
                        required
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        PDFのみ・10MBまで。ファイルは非公開で保存されます。
                      </p>

                    </div>
                    <div>
                      <label className="mb-1 block text-sm">備考メモ (任意)</label>
                      <Textarea
                        value={pdfMemo}
                        onChange={e => setPdfMemo(e.target.value)}
                      />
                    </div>
                    <div className="flex">
                      <Button type="submit" disabled={loading || !pdfFile || Number(pdfAmount) <= 0}>
                        提出する
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
