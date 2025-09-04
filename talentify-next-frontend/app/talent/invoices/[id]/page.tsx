'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const supabase = createClient()

interface Invoice {
  id: string
  offer_id: string
  amount: number
  transport_fee: number | null
  extra_fee: number | null
  notes: string | null
  invoice_number: string | null
  due_date: string | null
  status: string
  payment_status: string | null
  created_at: string | null
}

const statusLabels: Record<string, string> = {
  draft: '下書き',
  approved: '提出済み',
  submitted: '提出済み',
  paid: '支払い済み',
  rejected: '差し戻し',
}

export default function TalentInvoiceDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('invoices')
        .select(
          'id,offer_id,amount,transport_fee,extra_fee,notes,invoice_number,due_date,status,payment_status,created_at'
        )
        .eq('id', id)
        .single()
      const inv = data as Invoice | null
      setInvoice(inv)
      setInvoiceNumber(inv?.invoice_number ?? '')
      setDueDate(inv?.due_date ?? '')
      setNotes(inv?.notes ?? '')
      setLoading(false)
    }
    if (id) load()
  }, [id])

  if (loading) return <div className='p-4'>読み込み中...</div>
  if (!invoice) return <div className='p-4'>データがありません</div>

  const baseFee = invoice.amount - (invoice.transport_fee ?? 0) - (invoice.extra_fee ?? 0)

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('invoices')
      .update({
        invoice_number: invoiceNumber || null,
        due_date: dueDate || null,
        notes: notes || null,
      })
      .eq('id', id)
    setSaving(false)
    if (error) {
      toast.error('保存に失敗しました')
    } else {
      toast.success('保存しました')
      router.refresh()
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const { error } = await supabase
      .from('invoices')
      .update({
        invoice_number: invoiceNumber || null,
        due_date: dueDate || null,
        notes: notes || null,
      })
      .eq('id', id)
    if (error) {
      toast.error('提出に失敗しました')
      setSubmitting(false)
      return
    }
    const res = await fetch(`/api/invoices/${id}/submit`, { method: 'POST' })
    setSubmitting(false)
    if (res.ok) {
      toast.success('提出しました')
      router.replace('/talent/invoices')
    } else {
      toast.error('提出に失敗しました')
    }
  }

  return (
    <main className='p-6 space-y-4'>
      <h1 className='text-xl font-bold'>請求詳細</h1>

      <Card>
        <CardHeader>
          <CardTitle>請求情報</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm'>
          <div>作成日: {formatJaDateTimeWithWeekday(invoice.created_at ?? '')}</div>
          <div>
            請求書番号:{' '}
            {invoice.status === 'draft' ? (
              <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
            ) : (
              invoice.invoice_number ?? '-'
            )}
          </div>
          <div>
            支払期限:{' '}
            {invoice.status === 'draft' ? (
              <Input type='date' value={dueDate} onChange={e => setDueDate(e.target.value)} />
            ) : invoice.due_date ? (
              formatJaDateTimeWithWeekday(invoice.due_date)
            ) : (
              '-'
            )}
          </div>
          <div>
            ステータス:{' '}
            <Badge variant='outline'>
              {invoice.payment_status === 'paid'
                ? '支払い済み'
                : statusLabels[invoice.status]}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>金額内訳</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm'>
          <div>基本報酬: ¥{baseFee.toLocaleString('ja-JP')}</div>
          <div>交通費: ¥{(invoice.transport_fee ?? 0).toLocaleString('ja-JP')}</div>
          <div>追加料金: ¥{(invoice.extra_fee ?? 0).toLocaleString('ja-JP')}</div>
          <div>
            メモ:{' '}
            {invoice.status === 'draft' ? (
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} />
            ) : (
              invoice.notes || 'なし'
            )}
          </div>
        </CardContent>
      </Card>

      {invoice.status === 'draft' && (
        <div className='flex gap-2'>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            保存
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            提出
          </Button>
        </div>
      )}
    </main>
  )
}

