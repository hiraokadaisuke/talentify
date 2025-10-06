export type OfferStatusDb =
  | 'offer_created'
  | 'proposed'
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'canceled'
  | 'no_show'
  | 'rejected'
  | 'expired'
  | 'draft'

const MAP_UI_TO_DB: Record<string, OfferStatusDb> = {
  Draft: 'draft',
  Proposed: 'proposed',
  Pending: 'pending',
  Confirmed: 'confirmed',
  Completed: 'completed',
  Cancelled: 'canceled',
  canceled: 'canceled',
  cancelled: 'canceled',
  Canceled: 'canceled',
  NoShow: 'no_show',
  Rejected: 'rejected',
  Expired: 'expired',
  OfferCreated: 'offer_created',
}

export function toDbOfferStatus(
  v?: string | null
): OfferStatusDb | undefined {
  if (!v) return undefined
  const direct = MAP_UI_TO_DB[v]
  if (direct) return direct
  const lower = v.toLowerCase()
  return MAP_UI_TO_DB[lower] ?? (lower as OfferStatusDb)
}

// 表示用（任意：DB→UI）
export function toUiOfferStatus(v?: string | null): string | undefined {
  if (!v) return undefined
  if (v === 'canceled') return 'Cancelled'
  return v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
