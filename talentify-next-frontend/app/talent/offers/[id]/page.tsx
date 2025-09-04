'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import OfferChatThread from '@/components/offer/OfferChatThread'
import OfferSummary from '@/components/offer/OfferSummary'
import OfferPaymentStatusCard from '@/components/offer/OfferPaymentStatusCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { toast } from 'sonner'

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
        'id,status,date,updated_at,message,talent_id,user_id,paid,paid_at, talents(stage_name,avatar_url), stores(store_name)'
      )
      .eq('id', params.id)
      .or('and(status.eq.canceled,accepted_at.not.is.null),status.neq.canceled')
      .single()
    if (data) {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('id,status')
        .eq('offer_id', params.id)
        .maybeSingle()
      const invoiceStatus: 'not_submitted' | 'submitted' | 'paid' = invoice
        ? data.paid
          ? 'paid'
          : 'submitted'
        : 'not_submitted'
      setOffer({
        id: data.id,
        status: data.status,
        date: data.date,
        message: data.message,
        performerName: data.talents?.stage_name || '',
        performerAvatarUrl: data.talents?.avatar_url || null,
        storeName: data.stores?.store_name || '',
        updatedAt: data.updated_at,
        paid: data.paid,
        paidAt: data.paid_at,
        invoiceStatus,
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
      .update({ status: 'confirmed' })
      .eq('id', offer.id)
    if (error) {
      toast.error('承諾に失敗しました')
      setOffer(prev => ({ ...prev, status: 'pending' }))
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
      .update({ status: 'rejected' })
      .eq('id', offer.id)
    if (error) {
      toast.error('辞退に失敗しました')
      setOffer(prev => ({ ...prev, status: 'pending' }))
    } else {
      await loadOffer()
    }
    setActionLoading(null)
  }

  const showActions = ['accepted', 'confirmed', 'completed'].includes(offer.status)
  const invoiceLink = showActions
    ? invoiceId
      ? '/talent/invoices'
      : `/talent/invoices/new?offerId=${offer.id}`
    : undefined
  const invoiceText = invoiceId ? '請求履歴を見る' : '請求書を作成'
  const paymentLink = showActions ? `/talent/offers/${offer.id}/payment` : undefined
  const formattedUpdatedAt = format(new Date(offer.updatedAt), 'yyyy/MM/dd HH:mm', {
    locale: ja,
  })

  const renderStatusBadge = () => {
    if (offer.status === 'confirmed' || offer.status === 'accepted') {
      return <Badge>承認済み</Badge>
    }
    if (offer.status === 'rejected') {
      return <Badge variant="secondary">辞退済み</Badge>
    }
    if (offer.status === 'canceled') {
      return <Badge variant="destructive">キャンセル済み</Badge>
    }
    return <Badge variant="secondary">未承諾</Badge>
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full p-4">
      <div className="flex flex-col gap-4 w-full lg:w-1/3">
        <Card>
          <CardHeader>
            <CardTitle>オファー詳細</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <OfferSummary
              performerName={offer.performerName}
              performerAvatarUrl={offer.performerAvatarUrl}
              storeName={offer.storeName}
              date={offer.date}
              message={offer.message}
              invoiceStatus={offer.invoiceStatus}
            />
            {offer.status === 'pending' && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAccept}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === 'accept' ? '承諾中...' : '承諾'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDecline}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === 'decline' ? '辞退中...' : '辞退'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <OfferPaymentStatusCard paid={offer.paid} paidAt={offer.paidAt} />
      </div>
      <div className="flex flex-col flex-1 gap-4 w-full lg:w-2/3">
        <div className="flex items-center justify-between p-4 bg-white rounded shadow">
          <div className="flex items-center gap-2">
            {renderStatusBadge()}
            <span className="text-sm text-muted-foreground">
              最終更新: {formattedUpdatedAt}
            </span>
          </div>
          {invoiceLink && (
            <Button variant="default" size="sm" asChild>
              <Link href={invoiceLink}>{invoiceText}</Link>
            </Button>
          )}
        </div>
        <div id="chat" className="flex-1 min-h-0">
          <OfferChatThread
            offerId={offer.id}
            currentUserId={userId}
            currentRole="talent"
            paymentLink={paymentLink}
          />
        </div>
      </div>
    </div>
  )
}
