import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserWithClient } from '@/lib/auth/getCurrentUserWithClient'
import {
  deriveOfferInvoiceProgressStatus,
  getInvoiceStatusLabel,
  getPaymentStatusLabel,
} from '@/lib/invoices/status'
import TalentOfferClient from './TalentOfferClient'

type PageProps = {
  params: { id: string }
}

export default async function TalentOfferPage({ params }: PageProps) {
  const supabase = createClient()

  const [userResult, offerResult, invoiceResult] = await Promise.all([
    getCurrentUserWithClient(supabase),
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

  const user = userResult.user
  const data = offerResult.data
  const invoice = invoiceResult.data

  if (!user || !data || data.talents?.user_id !== user.id) {
    notFound()
  }

  const invoiceStatus = deriveOfferInvoiceProgressStatus({
    invoiceStatus: invoice?.status,
    invoicePaymentStatus: invoice?.payment_status,
    offerPaid: data.paid,
  })

  const offer = {
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
  }

  return (
    <TalentOfferClient
      initialOffer={offer}
      currentUserId={user.id}
      invoiceId={invoice?.id ?? null}
    />
  )
}
