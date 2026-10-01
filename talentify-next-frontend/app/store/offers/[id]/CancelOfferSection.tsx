'use client'

import OfferCancellationSection from '@/components/offers/OfferCancellationSection'

type Props = {
  offerId: string
  initialStatus: string
  initialCanceledAt?: string | null
  initialCanceledByRole?: string | null
  initialCancelReason?: string | null
  initialCancellationPhase?: string | null
  invoiceId?: string | null
}

export default function CancelOfferSection({
  offerId,
  initialStatus,
  initialCanceledAt = null,
  initialCanceledByRole = null,
  initialCancelReason = null,
  initialCancellationPhase = null,
  invoiceId = null,
}: Props) {
  return (
    <OfferCancellationSection
      offerId={offerId}
      role="store"
      status={initialStatus}
      canceledAt={initialCanceledAt}
      canceledByRole={initialCanceledByRole}
      cancelReason={initialCancelReason}
      cancellationPhase={initialCancellationPhase}
      invoiceId={invoiceId}
    />
  )
}
