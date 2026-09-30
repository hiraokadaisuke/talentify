export type OfferStepKey =
  | 'offer_consultation'
  | 'estimate'
  | 'contract'
  | 'visit'
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
  offer_consultation: 'オファー・相談',
  estimate: '見積',
  contract: '締結',
  visit: '来店実施',
  payment: '支払い',
  review: 'レビュー',
}

interface ProgressParams {
  status: string
  invoiceStatus: 'not_created' | 'draft' | 'submitted' | 'approved' | 'paid'
  paid: boolean
  reviewCompleted?: boolean
}

function resolveProgressBadge({ status, invoiceStatus, paid, reviewCompleted }: ProgressParams): OfferProgressBadge {
  if (reviewCompleted) return { label: 'レビュー済み', variant: 'success' }
  if (paid || invoiceStatus === 'paid') return { label: '支払い済み', variant: 'success' }
  if (status === 'confirmed' || invoiceStatus === 'approved') return { label: '締結済み', variant: 'success' }
  if (invoiceStatus === 'submitted') return { label: '見積確認待ち', variant: 'default' }
  if (invoiceStatus === 'draft') return { label: '見積作成中', variant: 'default' }
  if (status === 'rejected') return { label: '辞退済み', variant: 'secondary' }
  if (status === 'canceled') return { label: '取り下げ済み', variant: 'secondary' }
  return { label: '相談中', variant: 'secondary' }
}

export function getOfferProgress({
  status,
  invoiceStatus,
  paid,
  reviewCompleted = false,
}: ProgressParams): { steps: OfferProgressStep[]; current: OfferStepKey; badge: OfferProgressBadge } {
  const order: OfferStepKey[] = [
    'offer_consultation',
    'estimate',
    'contract',
    'visit',
    'payment',
    'review',
  ]

  const completed = new Set<OfferStepKey>()

  if (invoiceStatus !== 'not_created' || ['confirmed', 'completed'].includes(status)) {
    completed.add('offer_consultation')
  }
  if (['approved', 'paid'].includes(invoiceStatus) || ['confirmed', 'completed'].includes(status)) {
    completed.add('estimate')
    completed.add('contract')
  }
  if (paid || invoiceStatus === 'paid' || status === 'completed') {
    completed.add('visit')
    completed.add('payment')
  }
  if (reviewCompleted) completed.add('review')

  const current = order.find(step => !completed.has(step)) ?? 'review'
  const steps = order.map(step => ({
    key: step,
    title: OFFER_STEP_LABELS[step],
    status: completed.has(step) ? 'complete' as const : step === current ? 'current' as const : 'upcoming' as const,
  }))

  return { steps, current, badge: resolveProgressBadge({ status, invoiceStatus, paid, reviewCompleted }) }
}
