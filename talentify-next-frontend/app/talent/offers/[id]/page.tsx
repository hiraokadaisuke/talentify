'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { getOfferProgress } from '@/utils/offerProgress'
import { toast } from 'sonner'
import { toDbOfferStatus } from '@/app/lib/offerStatus'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import TalentOfferProgressPanel from './TalentOfferProgressPanel'
import {
  deriveOfferInvoiceProgressStatus,
  getInvoiceStatusLabel,
  getPaymentStatusLabel,
} from '@/lib/invoices/status'
import MessageCard from './MessageCard'

export default function TalentOfferPage() {
  const params = useParams<{ id: string }>()
  const supabase = createClient()
  const [offer, setOffer] = useState<any>(null)
  const [loaded, setLoaded] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<'accept' | 'decline' | null>(null)
  const [invoiceId, setInvoiceId] = useState<string | null>(null)

  const loadOffer = useCallback(async () => {
    const { data } = await supabase
      .from('offers')
      .select(
        `
        id,status,date,updated_at,created_at,message,talent_id,user_id,paid,paid_at,
        reviews(id),
        talents(stage_name,avatar_url,user_id),
        store:stores!offers_store_id_fkey(id, store_name, user_id)
      `
      )
      .eq('id', params.id)
      .or('and(status.eq.canceled,accepted_at.not.is.null),status.neq.canceled')
      .single()
    if (data) {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('id,status,payment_status')
        .eq('offer_id', params.id)
        .maybeSingle()
      const invoiceStatus = deriveOfferInvoiceProgressStatus({
        invoiceStatus: invoice?.status,
        invoicePaymentStatus: invoice?.payment_status,
        offerPaid: data.paid,
      })
      setOffer({
        id: data.id,
        status: data.status,
        date: data.date,
        message: data.message,
        performerName: data.talents?.stage_name || '',
        performerAvatarUrl: data.talents?.avatar_url || null,
        storeName: data.store?.store_name || '',
        updatedAt: data.updated_at,
        submittedAt: data.created_at,
        paid: data.paid,
        paidAt: data.paid_at,
        reviewCompleted: Array.isArray(data.reviews) && data.reviews.length > 0,
        invoiceStatus,
        invoiceStatusLabel: getInvoiceStatusLabel(invoice?.status),
        paymentStatusLabel: getPaymentStatusLabel(invoice?.payment_status, data.paid),
        storeUserId: data.store?.user_id ?? null,
      })
      setInvoiceId(invoice?.id ?? null)
    } else {
      setOffer(null)
      setInvoiceId(null)
    }
    setLoaded(true)
  }, [params.id, supabase])

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()
      setUserId(userData.user?.id ?? null)
      await loadOffer()
    }
    init()
  }, [loadOffer, supabase])

  if (!userId || !loaded) {
    return <p className="p-4">Loading...</p>
  }

  if (!offer) {
    return <p className="p-4">オファーが見つかりません</p>
  }

  const handleAccept = async () => {
    if (offer.status !== 'pending') return
    setActionLoading('accept')
    setOffer({ ...offer, status: 'confirmed' })
    const { error } = await supabase
      .from('offers')
      .update({ status: toDbOfferStatus('confirmed') })
      .eq('id', offer.id)
    if (error) {
      toast.error('承諾に失敗しました')
      setOffer((prev: any) => ({ ...prev, status: 'pending' }))
    } else {
      await loadOffer()
    }
    setActionLoading(null)
  }

  const handleDecline = async () => {
    if (offer.status !== 'pending') return
    setActionLoading('decline')
    setOffer({ ...offer, status: 'rejected' })
    const { error } = await supabase
      .from('offers')
      .update({ status: toDbOfferStatus('rejected') })
      .eq('id', offer.id)
    if (error) {
      toast.error('辞退に失敗しました')
      setOffer((prev: any) => ({ ...prev, status: 'pending' }))
    } else {
      await loadOffer()
    }
    setActionLoading(null)
  }

  const showActions = ['accepted', 'confirmed', 'completed'].includes(offer.status)
  const paymentLink = showActions && invoiceId ? `/talent/invoices/${invoiceId}` : undefined
  const formattedUpdatedAt = format(new Date(offer.updatedAt), 'yyyy/MM/dd HH:mm', { locale: ja })
  const statusLabel = getStatusLabel(offer.status)
  const statusClassName = getStatusBadgeClassName(offer.status)

  const { steps, current: currentStep } = getOfferProgress({
    status: offer.status,
    invoiceStatus: offer.invoiceStatus,
    paid: offer.paid,
    reviewCompleted: offer.reviewCompleted,
  })

  return (
    <div className="p-3 sm:p-5 lg:p-6">
      <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-3 lg:items-start">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">オファー詳細</h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{offer.storeName || '店舗未設定'}</span>
                    <span className="text-slate-300">/</span>
                    <span>{offer.performerName || 'タレント未設定'}</span>
                  </div>
                  <Badge className={cn('flex items-center gap-1', statusClassName)}>{statusLabel}</Badge>
                </div>
              </div>
              <div className="text-xs text-slate-500 md:text-right">
                <div className="font-medium text-slate-400">最終更新日時</div>
                <div>{formattedUpdatedAt}</div>
              </div>
            </div>
          </section>
          <TalentOfferProgressPanel
            steps={steps}
            initialActiveStep={currentStep}
            offer={{
              id: offer.id,
              status: offer.status,
              date: offer.date,
              updatedAt: offer.updatedAt,
              submittedAt: offer.submittedAt,
              paid: offer.paid,
              paidAt: offer.paidAt,
              invoiceStatus: offer.invoiceStatus,
              invoiceStatusLabel: offer.invoiceStatusLabel,
              paymentStatusLabel: offer.paymentStatusLabel,
              reviewCompleted: offer.reviewCompleted,
            }}
            invoiceId={invoiceId}
            paymentLink={paymentLink}
            onAcceptOffer={handleAccept}
            onDeclineOffer={handleDecline}
            actionLoading={actionLoading}
          />
        </div>
        <div className="lg:sticky lg:top-6">
          <MessageCard
            offerId={offer.id}
            currentUserId={userId}
            peerUserId={offer.storeUserId ?? ''}
            storeName={offer.storeName}
            talentName={offer.performerName}
          />
        </div>
      </div>
    </div>
  )
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'accepted':
    case 'confirmed':
      return '承認済み'
    case 'completed':
      return '完了'
    case 'rejected':
      return '辞退済み'
    case 'canceled':
      return 'キャンセル'
    case 'draft':
      return '下書き'
    default:
      return '承認待ち'
  }
}

function getStatusBadgeClassName(status: string) {
  switch (status) {
    case 'completed':
    case 'confirmed':
    case 'accepted':
      return 'bg-emerald-500 text-white'
    case 'draft':
      return 'bg-slate-200 text-slate-700'
    case 'rejected':
    case 'canceled':
      return 'bg-slate-300 text-slate-700'
    default:
      return 'bg-orange-400 text-white'
  }
}
