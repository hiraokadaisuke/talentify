'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { format, isBefore, parseISO } from 'date-fns'
import ja from 'date-fns/locale/ja'
import { addNotification } from '@/utils/notifications'
import { toast } from 'sonner'

interface Offer {
  id: string
  date: string
  time_range?: string | null
  created_at?: string | null
  message: string
  status: string | null
  contract_url?: string | null
  respond_deadline: string | null
  event_name?: string | null
  start_time?: string | null
  end_time?: string | null
  reward?: number | null
  notes?: string | null
  question_allowed?: boolean | null
  agreed?: boolean | null
  user_id?: string
  store_name?: string | null
  store_address?: string | null
  store_logo_url?: string | null
  invoice_date?: string | null
  invoice_amount?: number | null
  bank_name?: string | null
  bank_branch?: string | null
  bank_account_number?: string | null
  bank_account_holder?: string | null
  invoice_url?: string | null
  invoice_submitted?: boolean | null
  paid?: boolean | null
  paid_at?: string | null
}

export default function TalentOfferDetailPage() {
  const params = useParams<{ id: string }>()
  const supabase = createClient()
  const [offer, setOffer] = useState<Offer | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [editingInvoice, setEditingInvoice] = useState(false)
  const [invoiceDate, setInvoiceDate] = useState('')
  const [invoiceAmount, setInvoiceAmount] = useState(0)
  const [bankName, setBankName] = useState('')
  const [bankBranch, setBankBranch] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [bankAccountHolder, setBankAccountHolder] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleStatusChange = async (status: 'confirmed' | 'rejected') => {
    if (!offer) return
    const res = await fetch(`/api/offers/${offer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setOffer({ ...offer, status })
      if (status === 'confirmed' && offer.user_id) {
        await addNotification({
          user_id: offer.user_id,
          offer_id: offer.id,
          type: 'offer_accepted',
          title: 'オファーが承諾されました'
        })
      }
      toast.success(status === 'confirmed' ? 'オファーを承諾しました' : 'オファーを辞退しました')
    } else {
      toast.error('処理に失敗しました。もう一度お試しください')
    }
  }

  const confirmContract = async () => {
    if (!offer) return
    const res = await fetch(`/api/offers/${offer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agreed: true })
    })
    if (res.ok) {
      setOffer({ ...offer, agreed: true })
      if (offer.user_id) {
        await addNotification({
          user_id: offer.user_id,
          offer_id: offer.id,
          type: 'contract_checked',
          title: 'タレントが契約書を確認しました'
        })
      }
      toast.success('契約書を確認しました')
    } else {
      toast.error('更新に失敗しました')
    }
  }

  const submitInvoice = async () => {
    if (!offer) return
    const res = await fetch(`/api/offers/${offer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoice_date: invoiceDate,
        invoice_amount: invoiceAmount,
        bank_name: bankName,
        bank_branch: bankBranch,
        bank_account_number: bankAccountNumber,
        bank_account_holder: bankAccountHolder,
        invoice_submitted: true,
      }),
    })
    if (res.ok) {
      setOffer({
        ...offer,
        invoice_date: invoiceDate,
        invoice_amount: invoiceAmount,
        bank_name: bankName,
        bank_branch: bankBranch,
        bank_account_number: bankAccountNumber,
        bank_account_holder: bankAccountHolder,
        invoice_submitted: true,
      })
      if (offer.user_id) {
        await addNotification({
          user_id: offer.user_id,
          offer_id: offer.id,
          type: 'invoice_submitted',
          title: '請求書が提出されました'
        })
      }
      setEditingInvoice(false)
      toast.success('請求書を提出しました')
    } else {
      toast.error('更新に失敗しました')
    }
  }

  const handleInvoiceFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !offer) return
    const path = `${offer.id}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage
      .from('invoices')
      .upload(path, file, { upsert: true })
    if (error) {
      toast.error('アップロードに失敗しました')
      return
    }
    const { data } = await supabase.storage
      .from('invoices')
      .getPublicUrl(path)
    const url = data.publicUrl
    const res = await fetch(`/api/offers/${offer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_url: url, invoice_submitted: true })
    })
    if (res.ok) {
      setOffer({ ...offer, invoice_url: url, invoice_submitted: true })
      if (offer.user_id) {
        await addNotification({
          user_id: offer.user_id,
          offer_id: offer.id,
          type: 'invoice_submitted',
          title: '請求書が提出されました',
        })
      }
      toast.success('請求書をアップロードしました')
    } else {
      toast.error('更新に失敗しました')
    }
  }

  useEffect(() => {
    const load = async () => {
      setErrorMessage(null)
      const { data, error } = await supabase
        .from('offers')
        .select(
  `id, date, time_range, created_at, message, status, contract_url, respond_deadline, event_name, start_time, end_time, reward, notes, question_allowed, agreed, invoice_date, invoice_amount, bank_name, bank_branch, bank_account_number, bank_account_holder, invoice_submitted, invoice_url, paid, paid_at, user_id, store:store_id(store_name,store_address,avatar_url)`
)
        .eq('id', params.id)
        .single()

      if (!error && data) {
        const store = (data as any).store || {}
        const offerData = { ...(data as any) }
        delete offerData.store
        setOffer({
          ...offerData,
          store_name: store.store_name ?? null,
          store_address: store.store_address ?? null,
          store_logo_url: store.avatar_url ?? null,
        })
        setInvoiceDate(offerData.invoice_date || new Date().toISOString().slice(0,10))
        setInvoiceAmount(offerData.invoice_amount || offerData.reward || 0)
        setBankName(offerData.bank_name || '')
        setBankBranch(offerData.bank_branch || '')
        setBankAccountNumber(offerData.bank_account_number || '')
        setBankAccountHolder(offerData.bank_account_holder || '')
      } else {
        console.error('offer fetch error:', error)
        setOffer(null)
        setErrorMessage(error?.message || 'オファー情報を取得できませんでした')
      }
    }
    load()
  }, [params.id, supabase])

  if (errorMessage)
    return <p className="p-4 text-red-600">{errorMessage}</p>
  if (!offer) return <p className="p-4">Loading...</p>

  const deadline = offer.respond_deadline || ''
  const deadlinePassed = deadline && isBefore(parseISO(deadline), new Date())
  const timeRange =
    offer.time_range ??
    (offer.start_time && offer.end_time
      ? `${offer.start_time}〜${offer.end_time}`
      : null)

  const statusMap: Record<string, { label: string; className?: string }> = {
    pending: { label: '対応待ち', className: 'bg-yellow-500 text-white' },
    confirmed: { label: '承諾済', className: 'bg-green-600 text-white' },
    rejected: { label: '辞退済み', className: 'bg-gray-400 text-white' },
    completed: { label: '来店完了（レビュー投稿済）', className: 'bg-green-600 text-white' },
  }

  const statusInfo = statusMap[offer.status ?? 'pending']

  return (
    <div className="max-w-screen-md mx-auto p-6 space-y-6 pb-24">
      <Link href="/talent/offers" className="text-sm underline">
        ← オファー一覧へ戻る
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>店舗情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {offer.store_logo_url && (
            <div className="w-full flex justify-center">
              <Image
                src={offer.store_logo_url}
                alt="store logo"
                width={200}
                height={120}
                className="object-contain h-24 w-auto"
              />
            </div>
          )}
          {offer.store_name && <div className="text-lg font-bold">{offer.store_name}</div>}
          {offer.store_address && (
            <div className="text-sm text-muted-foreground">{offer.store_address}</div>
          )}
        </CardContent>
      </Card>

      {offer.invoice_submitted ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>請求情報</CardTitle>
            </CardHeader>
            <CardContent className='space-y-1 text-sm'>
              {offer.invoice_url ? (
                <a href={offer.invoice_url} target='_blank' className='text-blue-600 underline'>請求書を開く</a>
              ) : (
                <>
                  <div>請求日：{offer.invoice_date}</div>
                  <div>金額：¥{(offer.invoice_amount || 0).toLocaleString()}（税込）</div>
                  <div>
                    振込先：{offer.bank_name} {offer.bank_branch} {offer.bank_account_number}{' '}
                    {offer.bank_account_holder}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          {offer.paid && (
            <div className='text-green-600 text-sm'>✅ お支払いが完了しました（{format(parseISO(offer.paid_at || ''), 'yyyy年M月d日', { locale: ja })}）</div>
          )}
        </>
      ) : offer.status === 'confirmed' && offer.agreed ? (
        <Card>
          <CardHeader>
            <CardTitle>請求書</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            {editingInvoice ? (
              <div className='space-y-2'>
                <Input
                  type='date'
                  value={invoiceDate}
                  onChange={e => setInvoiceDate(e.target.value)}
                />
                <Input
                  type='number'
                  value={invoiceAmount}
                  onChange={e => setInvoiceAmount(Number(e.target.value))}
                />
                <Input
                  placeholder='銀行名'
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                />
                <Input
                  placeholder='支店名'
                  value={bankBranch}
                  onChange={e => setBankBranch(e.target.value)}
                />
                <Input
                  placeholder='口座番号'
                  value={bankAccountNumber}
                  onChange={e => setBankAccountNumber(e.target.value)}
                />
                <Input
                  placeholder='口座名義'
                  value={bankAccountHolder}
                  onChange={e => setBankAccountHolder(e.target.value)}
                />
                <Button onClick={submitInvoice}>請求書を提出する</Button>
              </div>
            ) : (
              <div className='space-y-2'>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='application/pdf'
                  className='hidden'
                  onChange={handleInvoiceFileChange}
                />
                <Button onClick={() => fileInputRef.current?.click()}>請求書アップロード</Button>
                <Button onClick={() => setEditingInvoice(true)}>請求書作成</Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className='text-sm'>まだ請求書が提出されていません</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>オファー内容</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>オファーID: {offer.id}</div>
          {offer.created_at && (
            <div>作成日: {format(parseISO(offer.created_at), 'yyyy-MM-dd')}</div>
          )}
          <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
          {deadline && (
            <div className={deadlinePassed ? 'text-red-600' : ''}>
              要返信: {format(parseISO(deadline), 'yyyy-MM-dd')}
            </div>
          )}
          {offer.event_name && <div>イベント名: {offer.event_name}</div>}
        <div>訪問日: {format(parseISO(offer.date), 'yyyy-MM-dd')}</div>
          {timeRange && <div>時間帯: {timeRange}</div>}
          {typeof offer.reward === 'number' && (
            <div>報酬: {offer.reward.toLocaleString()}円</div>
          )}
          <div className="whitespace-pre-wrap">{offer.message}</div>
          {offer.notes && (
            <div className="p-2 bg-muted rounded text-sm whitespace-pre-wrap">
              {offer.notes}
            </div>
          )}
          {offer.contract_url && (
            <div className="space-x-2">
              <a href={offer.contract_url} target="_blank" className="text-blue-600 underline">契約書を開く</a>
              {offer.agreed && <Badge>確認済</Badge>}
            </div>
          )}
          {offer.agreed !== undefined && (
            <div>同意: {offer.agreed ? '済' : '未'}</div>
          )}
        </CardContent>
      </Card>

      {offer.question_allowed && (
        <div className="text-right text-sm">
          <Button variant="link" onClick={() => alert('質問機能は未実装です')}>質問する</Button>
        </div>
      )}

      {offer.contract_url && !offer.agreed && (
        <div className="text-center">
          <Button onClick={confirmContract}>内容を確認しました</Button>
        </div>
      )}

      {offer.status === 'pending' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-4 justify-center">
          <Button
            variant="secondary"
            onClick={() => handleStatusChange('rejected')}
          >
            見送る
          </Button>
          <Button onClick={() => handleStatusChange('confirmed')}>承諾する</Button>
        </div>
      )}

      {/* Toasts are handled globally */}
    </div>
  )
}
