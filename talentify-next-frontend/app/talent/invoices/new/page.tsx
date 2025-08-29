'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function TalentInvoiceNewPage() {
  const searchParams = useSearchParams()
  const offerId = searchParams.get('offerId')
  const router = useRouter()
  const supabase = createClient()
  const [amount, setAmount] = useState('')
  const [invoiceUrl, setInvoiceUrl] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      if (!offerId) return
      const { data: existing } = await supabase
        .from('invoices')
        .select('id')
        .eq('offer_id', offerId)
        .maybeSingle()
      if (existing?.id) {
        router.replace(`/talent/invoices/${existing.id}`)
        return
      }
      const { data } = await supabase
        .from('offers')
        .select('reward')
        .eq('id', offerId)
        .single()
      if (data) {
        setAmount(String(data.reward ?? ''))
      }
    }
    init()
  }, [offerId, router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offerId) return
    setLoading(true)
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offer_id: offerId,
        amount: Number(amount),
        invoice_url: invoiceUrl,
      }),
    })
    if (!res.ok) {
      toast.error('請求書の作成に失敗しました')
      setLoading(false)
      return
    }
    const data = await res.json()
    router.replace(`/talent/invoices/${data.id}`)
  }

  return (
    <main className="p-6 max-w-md space-y-4">
      <h1 className="text-xl font-bold">請求書を作成</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">金額</label>
          <Input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-2">請求書URL</label>
          <Input
            type="text"
            value={invoiceUrl}
            onChange={e => setInvoiceUrl(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={loading || !offerId}>
          {loading ? '作成中...' : '作成'}
        </Button>
      </form>
    </main>
  )
}
