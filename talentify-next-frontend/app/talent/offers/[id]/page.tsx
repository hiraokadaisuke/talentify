'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import OfferSummary from '@/components/offer/OfferSummary'
import OfferPaymentStatusCard from '@/components/offer/OfferPaymentStatusCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getOfferProgress } from '@/utils/offerProgress'
import { toast } from 'sonner'
import TalentOfferProgressPanel from './TalentOfferProgressPanel'

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
        'id,status,date,updated_at,created_at,message,talent_id,user_id,paid,paid_at, talents(stage_name,avatar_url), stores(store_name)'
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
        submittedAt: data.created_at,
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
      .update({ status: 'rejected' })
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
  const paymentLink = showActions ? `/talent/offers/${offer.id}/payment` : undefined

  const { steps, current: currentStep } = getOfferProgress({
    status: offer.status,
    invoiceStatus: offer.invoiceStatus,
    paid: offer.paid,
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8">
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
          }}
          invoiceId={invoiceId}
          paymentLink={paymentLink}
          message={{
            offerId: offer.id,
            currentUserId: userId,
            storeName: offer.storeName,
            talentName: offer.performerName,
          }}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-sm">
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
                <div className="flex flex-wrap justify-end gap-2">
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
      </div>
    </div>
  )
}
