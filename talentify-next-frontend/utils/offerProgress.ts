export type OfferStepKey =
  | 'offer_submitted'
  | 'approval'
  | 'visit'
  | 'invoice'
  | 'payment'
  | 'review'

export type OfferProgressStatus = 'complete' | 'current' | 'upcoming'

export interface OfferProgressStep {
  key: OfferStepKey
  title: string
  status: OfferProgressStatus
  subLabel?: string
}

export type OfferProgressBadgeVariant = 'default' | 'secondary' | 'success'

export interface OfferProgressBadge {
  label: string
  variant: OfferProgressBadgeVariant
}

export const OFFER_STEP_LABELS: Record<OfferStepKey, string> = {
  offer_submitted: 'オファー提出',
  approval: '承認',
  visit: '来店実施',
  invoice: '請求',
  payment: '支払い',
  review: 'レビュー',
}

interface ProgressParams {
  status: string
  invoiceStatus: 'not_submitted' | 'submitted' | 'paid'
  paid: boolean
  reviewCompleted?: boolean
}

function resolveProgressBadge({
  status,
  invoiceStatus,
  paid,
  reviewCompleted,
}: ProgressParams): OfferProgressBadge {
  if ((paid || invoiceStatus === 'paid') && !reviewCompleted) {
    return {
      label: 'レビュー待ち',
      variant: 'default',
    }
  }

  if (paid || invoiceStatus === 'paid' || reviewCompleted) {
    return {
      label: '支払い済み',
      variant: 'success',
    }
  }

  if (status === 'completed') {
    return {
      label: '来店完了',
      variant: 'success',
    }
  }

  if (status === 'confirmed') {
    return {
      label: '来店予定',
      variant: 'default',
    }
  }

  if (status === 'accepted') {
    return {
      label: '承認済み',
      variant: 'default',
    }
  }

  return {
    label: '承認待ち',
    variant: 'secondary',
  }
}

export function getOfferProgress({
  status,
  invoiceStatus,
  paid,
  reviewCompleted = false,
}: ProgressParams): { steps: OfferProgressStep[]; current: OfferStepKey; badge: OfferProgressBadge } {
  const order: OfferStepKey[] = [
    'offer_submitted',
    'approval',
    'visit',
    'invoice',
    'payment',
    'review',
  ]

  const completed = new Set<OfferStepKey>(['offer_submitted'])

  if (['accepted', 'confirmed', 'completed'].includes(status)) {
    completed.add('approval')
  }

  if (status === 'completed') {
    completed.add('visit')
  }

  if (invoiceStatus !== 'not_submitted' || paid) {
    completed.add('invoice')
  }

  if (paid || invoiceStatus === 'paid') {
    completed.add('payment')
  }

  if (reviewCompleted) {
    completed.add('review')
  }

  const current = order.find(step => !completed.has(step)) ?? 'review'

  const steps: OfferProgressStep[] = order.map(step => ({
    key: step,
    title: OFFER_STEP_LABELS[step],
    status: completed.has(step)
      ? 'complete'
      : step === current
        ? 'current'
        : 'upcoming',
  }))

  return { steps, current, badge: resolveProgressBadge({ status, invoiceStatus, paid, reviewCompleted }) }
}
