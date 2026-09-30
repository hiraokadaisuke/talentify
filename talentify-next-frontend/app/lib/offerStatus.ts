import type { Database } from '@/types/supabase'

export type OfferStatusDb = Database['public']['Enums']['status_type']

const VALID_DB_STATUSES = new Set<OfferStatusDb>([
  'draft',
  'pending',
  'approved',
  'rejected',
  'completed',
  'offer_created',
  'confirmed',
  'canceled',
  'no_show',
  'submitted',
])

const MAP_UI_TO_DB: Record<string, OfferStatusDb> = {
  Draft: 'draft',
  draft: 'draft',
  Proposed: 'pending',
  proposed: 'pending',
  Pending: 'pending',
  pending: 'pending',
  Approved: 'approved',
  approved: 'approved',
  Accepted: 'confirmed',
  accepted: 'confirmed',
  Confirmed: 'confirmed',
  confirmed: 'confirmed',
  Completed: 'completed',
  completed: 'completed',
  Cancelled: 'canceled',
  cancelled: 'canceled',
  Canceled: 'canceled',
  canceled: 'canceled',
  NoShow: 'no_show',
  no_show: 'no_show',
  Rejected: 'rejected',
  rejected: 'rejected',
  Expired: 'canceled',
  expired: 'canceled',
  OfferCreated: 'offer_created',
  offer_created: 'offer_created',
  Submitted: 'submitted',
  submitted: 'submitted',
}

export function toDbOfferStatus(v?: string | null): OfferStatusDb | undefined {
  if (!v) return undefined

  const mapped = MAP_UI_TO_DB[v] ?? MAP_UI_TO_DB[v.toLowerCase()]
  if (mapped) return mapped

  const normalized = v.toLowerCase() as OfferStatusDb
  return VALID_DB_STATUSES.has(normalized) ? normalized : undefined
}

export function toUiOfferStatus(v?: string | null): string | undefined {
  if (!v) return undefined
  if (v === 'canceled') return 'Cancelled'
  return v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
