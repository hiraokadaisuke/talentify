export type OfferStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'offer_created'
  | 'confirmed'

export type OfferInsert = {
  user_id: string
  store_id: string
  talent_id: string
  date: string
  time_range: string
  agreed: boolean
  message?: string
  status?: OfferStatus
}
