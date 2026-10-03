'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Copy, ExternalLink, Megaphone } from 'lucide-react'
import { getOfferProgress } from '@/utils/offerProgress'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import TalentOfferProgressPanel from './TalentOfferProgressPanel'
import MessageCard from './MessageCard'

export default function TalentOfferClient({
  initialOffer,
  currentUserId,
  invoiceId,
}: {
  initialOffer: any
  currentUserId: string
  invoiceId: string | null
}) {
  const [offer, setOffer] = useState<any>(initialOffer)
  const [actionLoading, setActionLoading] = useState<'decline' | null>(null)
  const userId = currentUserId

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
          <div className="space-y-3">
            {offer.publicEventUrl && (
              <section className="rounded-2xl border border-orange-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.05)]">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-[#C2410C]">
                    <Megaphone className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-slate-950">来店情報</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      この来店予定は一般向けページで公開されています。
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    href={offer.publicEventUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[#0B1F3B] px-3 text-xs font-bold text-white"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    公開ページ
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(`${window.location.origin}${offer.publicEventUrl}`)
                        toast.success('公開URLをコピーしました')
                      } catch {
                        toast.error('URLをコピーできませんでした')
                      }
                    }}
                    className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    URLコピー
                  </button>
                </div>
              </section>
            )}
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
