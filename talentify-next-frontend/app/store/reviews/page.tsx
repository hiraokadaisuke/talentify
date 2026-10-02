import StoreReviewsClient from './ReviewsClient'
import { createClient } from '@/lib/supabase/server'
import { getProtectedRequestUserId } from '@/lib/auth/getProtectedRequestUserId'
import { toDbOfferStatus } from '@/app/lib/offerStatus'
import type { CompletedOffer } from '@/utils/getCompletedOffersForStore'

type RawCompletedOffer = {
  id: string
  talent_id: string
  store_id: string
  date: string
  message: string
  reviews: { id: string }[] | null
  talents: { stage_name: string | null } | null
}

type ReviewSummary = {
  offer_id: string
  rating: number
}

async function loadInitialReviews(): Promise<{
  offers: CompletedOffer[]
  reviewByOfferId: Record<string, ReviewSummary>
  loadError: boolean
}> {
  const supabase = createClient()

  try {
    const { userId } = await getProtectedRequestUserId(supabase)
    if (!userId) {
      return { offers: [], reviewByOfferId: {}, loadError: false }
    }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (storeError) throw storeError
    if (!store) {
      return { offers: [], reviewByOfferId: {}, loadError: false }
    }

    const completedStatus = toDbOfferStatus('completed') ?? 'completed'

    const { data, error } = await supabase
      .from('offers')
      .select('id, talent_id, store_id, date, message, reviews(id), talents(stage_name)')
      .eq('store_id', store.id)
      .eq('status', completedStatus)
      .eq('paid', true)

    if (error) throw error

    const rawOffers = (data ?? []) as unknown as RawCompletedOffer[]
    const offers = rawOffers.map(offer => ({
      id: offer.id,
      talent_id: offer.talent_id,
      store_id: offer.store_id,
      date: offer.date,
      message: offer.message,
      reviewed: Boolean(offer.reviews?.length),
      talent_name: offer.talents?.stage_name ?? null,
    })) as CompletedOffer[]

    if (offers.length === 0) {
      return { offers, reviewByOfferId: {}, loadError: false }
    }

    const { data: reviewData, error: reviewError } = await supabase
      .from('reviews')
      .select('offer_id, rating')
      .in('offer_id', offers.map(offer => offer.id))

    if (reviewError) throw reviewError

    const reviewByOfferId = (reviewData ?? []).reduce<Record<string, ReviewSummary>>((acc, item) => {
      if (!acc[item.offer_id]) {
        acc[item.offer_id] = item as ReviewSummary
      }
      return acc
    }, {})

    return { offers, reviewByOfferId, loadError: false }
  } catch (error) {
    console.error('failed to preload store reviews', error)
    return { offers: [], reviewByOfferId: {}, loadError: true }
  }
}

export default async function StoreReviewsPage() {
  const { offers, reviewByOfferId, loadError } = await loadInitialReviews()

  return (
    <StoreReviewsClient
      initialOffers={offers}
      initialReviewByOfferId={reviewByOfferId}
      initialLoadError={loadError}
    />
  )
}
