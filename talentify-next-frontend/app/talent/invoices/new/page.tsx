'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { toast } from 'sonner'

export default function TalentInvoiceNewPage() {
  const searchParams = useSearchParams()
  const offerId = searchParams.get('offerId')
  const router = useRouter()
  const supabase = createClient()

  const [offer, setOffer] = useState<any | null>(null)
  const [invoice, setInvoice] = useState<any | null>(null)

  const [baseFee, setBaseFee] = useState('')
  const [transportFee, setTransportFee] = useState('')
  const [extraFee, setExtraFee] = useState('')
  const [memo, setMemo] = useState('')

  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfMemo, setPdfMemo] = useState('')

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      if (!offerId) return
      const { data: offerData } = await supabase
        .from('offers')
        .select('id, date, reward, message, stores(store_name)')
        .eq('id', offerId)
        .single()
      if (offerData) setOffer(offerData)
      const { data: invData } = await supabase
        .from('invoices')
        .select('id, amount, status, payment_status, invoice_url')
        .eq('offer_id', offerId)
        .maybeSingle()
      if (invData) {
        setInvoice(invData)
        setBaseFee(String(invData.amount ?? ''))
      }
    }
    init()
  }, [offerId, supabase])

  const total =
    Number(baseFee || 0) +
    Number(transportFee || 0) +
    Number(extraFee || 0)

  const statusLabel = () => {
    if (invoice?.payment_status === 'paid') return '支払済み'
    if (invoice?.status === 'approved') return '提出済み'
    return '下書き'
  }

  const currentStep = () => {
    if (invoice?.payment_status === 'paid') return 2
    return invoice?.status === 'approved' ? 1 : 0
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
          body: JSON.stringify({ amount: total }),
        })
        if (!res.ok) throw new Error('patch failed')
      } else {
        const res = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offer_id: offerId, amount: total }),
        })
        if (!res.ok) throw new Error('post failed')
        const data = await res.json()
        id = data.id
      }
      router.replace(`/talent/invoices/${id}`)
    } catch (e) {
      toast.error('下書き保存に失敗しました')
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
          body: JSON.stringify({ amount: total }),
        })
        if (!res.ok) throw new Error('patch failed')
      } else {
        const res = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offer_id: offerId, amount: total }),
        })
        if (!res.ok) throw new Error('post failed')
        const data = await res.json()
        id = data.id
      }
      await fetch(`/api/invoices/${id}/submit`, { method: 'POST' })
      router.replace(`/talent/invoices/${id}`)
    } catch (e) {
      toast.error('提出に失敗しました')
      setLoading(false)
    }
  }

  const submitPdf = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offerId || !pdfFile) return
    setLoading(true)
    let id = invoice?.id
    try {
      const ext = pdfFile.name.split('.').pop()
      const path = `${offerId}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('invoices')
        .upload(path, pdfFile)
      if (upErr) throw upErr
      const { data: urlData } = supabase.storage
        .from('invoices')
        .getPublicUrl(path)
      const invoiceUrl = urlData.publicUrl
      if (id) {
        const res = await fetch(`/api/invoices/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoice_url: invoiceUrl }),
        })
        if (!res.ok) throw new Error('patch failed')
      } else {
        const res = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offer_id: offerId,
            amount: 0,
            invoice_url: invoiceUrl,
          }),
        })
        if (!res.ok) throw new Error('post failed')
        const data = await res.json()
        id = data.id
      }
      await fetch(`/api/invoices/${id}/submit`, { method: 'POST' })
      router.replace(`/talent/invoices/${id}`)
    } catch (e) {
      toast.error('提出に失敗しました')
      setLoading(false)
    }
  }

  const formattedDate = offer?.date
    ? format(new Date(offer.date), 'yyyy/MM/dd (EEE)', { locale: ja })
    : ''

  const steps = ['下書き保存', '提出済み', '支払い完了']

  return (
    <main className="p-6">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[420px,1fr] gap-6">
        <div className="flex items-center justify-between lg:col-span-2">
          <h1 className="text-xl font-bold">請求書を作成</h1>
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
              <div>店舗名: {offer?.stores?.store_name}</div>
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
            <CardTitle>請求書</CardTitle>
          </CardHeader>
          <CardContent>
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
                  <div className="flex justify-end gap-2">
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
                    <label className="mb-1 block text-sm">PDFファイル</label>
                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={e => setPdfFile(e.target.files?.[0] ?? null)}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">備考メモ (任意)</label>
                    <Textarea
                      value={pdfMemo}
                      onChange={e => setPdfMemo(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading || !pdfFile}>
                      提出する
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
