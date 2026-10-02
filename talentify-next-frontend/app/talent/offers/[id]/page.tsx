'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { getOfferProgress } from '@/utils/offerProgress'
import { toast } from 'sonner'
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
  const supabase = useMemo(() => createClient(), [])
  const [offer, setOffer] = useState<any>(null)
  const [loaded, setLoaded] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<'decline' | null>(null)
  const [invoiceId, setInvoiceId] = useState<string | null>(null)

  const loadOffer = useCallback(async () => {
    const [{ data }, { data: invoice }] = await Promise.all([
      supabase
        .from('offers')
        .select(
          `
          id,status,date,start_time,end_time,time_range,reward,updated_at,created_at,message,talent_id,user_id,paid,paid_at,canceled_at,canceled_by_role,cancellation_reason,cancellation_stage,no_show_at,no_show_reason,no_show_reported_by_user_id,
          reviews(id),
          talents(stage_name,avatar_url,user_id),
          store:stores!offers_store_id_fkey(id, store_name, user_id)
        `
        )
        .eq('id', params.id)
        .single(),
      supabase
        .from('invoices')
        .select('id,status,payment_status')
        .eq('offer_id', params.id)
        .maybeSingle(),
    ])
    if (data) {
      const invoiceStatus = deriveOfferInvoiceProgressStatus({
        invoiceStatus: invoice?.status,
        invoicePaymentStatus: invoice?.payment_status,
        offerPaid: data.paid,
      })
      setOffer({
        id: data.id,
        status: data.status,
        date: data.date,
        timeRange: data.time_range,
        endTime: data.end_time,
        reward: data.reward,
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
        canceledAt: data.canceled_at ?? null,
        canceledByRole: data.canceled_by_role ?? null,
        cancellationReason: data.cancellation_reason ?? null,
        cancellationStage: data.cancellation_stage ?? null,
        noShowAt: data.no_show_at ?? null,
        noShowReason: data.no_show_reason ?? null,
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
      const [userResult] = await Promise.all([supabase.auth.getUser(), loadOffer()])
      setUserId(userResult.data.user?.id ?? null)
    }
    init()
  }, [loadOffer, supabase])

  if (!userId || !loaded) {
    return <p className="p-4">Loading...</p>
  }

  if (!offer) {
    return <p className="p-4">オファーが見つかりません</p>
  }

  const handleDecline = async () => {
    if (offer.status !== 'pending') return
    setActionLoading('decline')
    setOffer({ ...offer, status: 'rejected' })
    const response = await fetch(`/api/offers/${offer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' }),
    })
    if (!response.ok) {
      toast.error('辞退に失敗しました')
      setOffer((prev: any) => ({ ...prev, status: 'pending' }))
    } else {
      toast.success('オファーを辞退しました')
    }
    setActionLoading(null)
  }

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
    <div>
      <div className="mx-auto grid min-w-0 w-full max-w-6xl gap-4 lg:grid-cols-3 lg:items-start">
        <div className="min-w-0 space-y-4 lg:col-span-2">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]">
            <div className="p-4 sm:p-5">
              <Link href="/talent/offers" className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-[#C2410C]">
                <ArrowLeft className="h-3.5 w-3.5" />
                オファー一覧へ
              </Link>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <p className="text-[10px] font-black tracking-[0.15em] text-[#C2410C]">OFFER DETAIL</p>
                <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">オファー詳細</h1>
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
            </div>
            <div className="h-1 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]" />
          </section>
          <TalentOfferProgressPanel
            steps={steps}
            initialActiveStep={currentStep}
            offer={{
              id: offer.id,
              status: offer.status,
              date: offer.date,
              timeRange: offer.timeRange,
              endTime: offer.endTime,
              reward: offer.reward,
              updatedAt: offer.updatedAt,
              submittedAt: offer.submittedAt,
              paid: offer.paid,
              paidAt: offer.paidAt,
              invoiceStatus: offer.invoiceStatus,
              invoiceStatusLabel: offer.invoiceStatusLabel,
              paymentStatusLabel: offer.paymentStatusLabel,
              reviewCompleted: offer.reviewCompleted,
              message: offer.message,
              canceledAt: offer.canceledAt,
              canceledByRole: offer.canceledByRole,
              cancellationReason: offer.cancellationReason,
              cancellationStage: offer.cancellationStage,
              noShowAt: offer.noShowAt,
              noShowReason: offer.noShowReason,
            }}
            invoiceId={invoiceId}
            onDeclineOffer={handleDecline}
            actionLoading={actionLoading}
          />
        </div>
        <div className="min-w-0 lg:sticky lg:top-6">
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
      return '進行中'
    case 'completed':
      return '完了'
    case 'rejected':
      return '辞退済み'
    case 'canceled':
      return 'キャンセル'
    case 'no_show':
      return '来店なし'
    case 'draft':
      return '下書き'
    default:
      return '相談中'
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
    case 'no_show':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-orange-400 text-white'
  }
}
