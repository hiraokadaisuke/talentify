'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import jsPDF from 'jspdf'
import { addNotification } from '@/utils/notifications'
import ReviewModal from '@/components/modals/ReviewModal'
import { toast } from 'sonner'

interface Offer {
  id: string
  date: string
  contract_url?: string | null
  agreed?: boolean | null
  message: string
  status: string | null
  created_at?: string | null
  talent_stage_name?: string | null
  talent_id?: string
  user_id?: string
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

export default function StoreOfferDetailPage() {
  const params = useParams<{ id: string }>()
  const supabase = createClient()
  const [offer, setOffer] = useState<Offer | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [reviewed, setReviewed] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('id,date,contract_url,agreed,message,status,created_at,invoice_date,invoice_amount,bank_name,bank_branch,bank_account_number,bank_account_holder,invoice_submitted,invoice_url,paid,paid_at,user_id,talent_id,talents(stage_name)')
        .eq('id', params.id)
        .single()

      if (!error && data) {
        const talent = (data as any).talents || {}
        const o = { ...(data as any), talent_stage_name: talent.stage_name }
        delete o.talents
        setOffer(o as Offer)
        const { data: rev } = await supabase
          .from('reviews' as any)
          .select('id')
          .eq('offer_id', params.id)
          .single()
        if (rev) setReviewed(true)
      }
    }
    load()
  }, [params.id, supabase])


  const uploadContract = async () => {
    if (!offer || !file) return
    const path = `${offer.id}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage
      .from('contracts')
      .upload(path, file, { upsert: true })
    if (error) {
      toast.error('アップロードに失敗しました')
      return
    }
    const { data } = await supabase.storage
      .from('contracts')
      .getPublicUrl(path)
    const url = data.publicUrl
    const res = await fetch(`/api/offers/${offer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contract_url: url })
    })
    if (res.ok) {
      setOffer({ ...offer, contract_url: url })
      setFile(null)
      if (offer.talent_id) {
        await addNotification({
          user_id: offer.talent_id,
          offer_id: offer.id,
          type: 'contract_uploaded',
          title: '契約書がアップロードされました'
        })
      }
      toast.success('契約書をアップロードしました')
    } else {
      toast.error('更新に失敗しました')
    }
  }

  const downloadInvoice = () => {
    if (!offer || !offer.invoice_submitted) return
    const doc = new jsPDF()
    doc.text(`請求日: ${offer.invoice_date}`, 10, 10)
    doc.text(
      `金額: ¥${(offer.invoice_amount || 0).toLocaleString()} (税込)`,
      10,
      20
    )
    doc.text(
      `振込先: ${offer.bank_name || ''} ${offer.bank_branch || ''} ${
        offer.bank_account_number || ''
      } ${offer.bank_account_holder || ''}`,
      10,
      30
    )
    doc.save(`invoice-${offer.id}.pdf`)
  }

  const handlePaid = async () => {
    if (!offer) return
    const res = await fetch(`/api/offers/${offer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paid: true, paid_at: new Date().toISOString() })
    })
    if (res.ok) {
      const now = new Date().toISOString()
      setOffer({ ...offer, paid: true, paid_at: now })
      if (offer.talent_id) {
        await addNotification({
          user_id: offer.talent_id,
          offer_id: offer.id,
          type: 'payment_completed',
          title: 'お支払いが完了しました'
        })
      }
      toast.success('支払い完了を登録しました')
    } else {
      toast.error('更新に失敗しました')
    }
  }

  if (!offer) return <p className='p-4'>Loading...</p>

  return (
    <div className='max-w-screen-md mx-auto p-6 space-y-4'>
      <Link href='/store/offers' className='text-sm underline'>← オファー一覧へ戻る</Link>
      <h1 className='text-xl font-bold'>オファー詳細</h1>
      <div className='space-y-2 text-sm'>
        {offer.talent_stage_name && <div>演者: {offer.talent_stage_name}</div>}
        {offer.created_at && <div>作成日: {offer.created_at.slice(0,10)}</div>}
        <div className='whitespace-pre-wrap'>{offer.message}</div>
      </div>
      <div className='space-y-2'>
        <div>訪問日: {format(parseISO(offer.date), 'yyyy-MM-dd')}</div>
      </div>
      {offer.contract_url && (
        <div className='space-y-1'>
          <a href={offer.contract_url} target='_blank' className='text-blue-600 underline'>契約書を開く</a>
          {offer.agreed && <Badge className='ml-2'>確認済</Badge>}
        </div>
      )}
      {offer.invoice_submitted ? (
        offer.invoice_url ? (
          <div className='space-y-1 text-sm'>
            <a href={offer.invoice_url} target='_blank' className='text-blue-600 underline'>請求書を開く</a>
            {offer.paid ? (
              <Badge className='ml-2'>支払い済</Badge>
            ) : (
              <Button size='sm' onClick={handlePaid}>支払い完了を登録する</Button>
            )}
          </div>
        ) : (
          <div className='space-y-1 text-sm'>
            <h2 className='font-semibold'>請求情報</h2>
            <div>請求日: {offer.invoice_date}</div>
            <div>金額: ¥{(offer.invoice_amount || 0).toLocaleString()}（税込）</div>
            <div>
              振込先: {offer.bank_name} {offer.bank_branch} {offer.bank_account_number}{' '}
              {offer.bank_account_holder}
            </div>
            <Button size='sm' onClick={downloadInvoice}>請求書をダウンロードする</Button>
            {offer.paid ? (
              <Badge className='ml-2'>支払い済</Badge>
            ) : (
              <Button size='sm' onClick={handlePaid}>支払い完了を登録する</Button>
            )}
          </div>
        )
      ) : (
        <div className='text-sm'>まだ請求書が提出されていません</div>
      )}
      {offer.status === 'confirmed' && (
        <div className='space-y-2'>
          <input type='file' accept='application/pdf,image/*' onChange={e => setFile(e.target.files?.[0] || null)} />
          <Button onClick={uploadContract} disabled={!file}>アップロード</Button>
        </div>
      )}
      {(offer.status === 'confirmed' || offer.status === 'completed') && (
        reviewed ? (
          <Badge>レビュー投稿済（来店完了）</Badge>
        ) : (
          <div className='space-y-2'>
            <Badge variant='secondary'>レビュー未投稿</Badge>
            <ReviewModal
              offerId={offer.id}
              talentId={offer.talent_id || ''}
              storeId={offer.user_id || ''}
              trigger={<Button>レビューを投稿する</Button>}
              onSubmitted={() => {
                setReviewed(true)
                setOffer({ ...offer, status: 'completed' })
                toast.success('レビューを投稿しました')
              }}
            />
          </div>
        )
      )}
      {/* Toasts are handled globally */}
    </div>
  )
}
