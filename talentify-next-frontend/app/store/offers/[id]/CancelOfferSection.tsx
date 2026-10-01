'use client'

import OfferCancellationSection from '@/components/offers/OfferCancellationSection'

type Props = {
  offerId: string
  initialStatus: string
  initialCanceledAt?: string | null
  initialCanceledByRole?: string | null
  initialCancellationReason?: string | null
  initialCancellationStage?: string | null
  invoiceId?: string | null
}

export default function CancelOfferSection({
  offerId,
  initialStatus,
  initialCanceledAt = null,
  initialCanceledByRole = null,
  initialCancellationReason = null,
  initialCancellationStage = null,
  invoiceId = null,
}: Props) {
  return (
    <OfferCancellationSection
      offerId={offerId}
      role="store"
      status={initialStatus}
      canceledAt={initialCanceledAt}
      canceledByRole={initialCanceledByRole}
      cancellationReason={initialCancellationReason}
      cancellationStage={initialCancellationStage}
      invoiceId={invoiceId}
    />
  )
}
