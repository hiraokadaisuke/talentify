export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'canceled'

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
