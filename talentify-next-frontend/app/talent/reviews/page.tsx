import TalentReviewsClient from './ReviewsClient'
import { createClient } from '@/lib/supabase/server'
import type { TalentReview } from '@/utils/getReviewsForTalent'

async function loadInitialReviews(): Promise<{
  reviews: TalentReview[]
  loadError: boolean
}> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.rpc('get_reviews_for_current_talent')
    if (error) throw error

    const reviews = (data ?? []).map((review: any) => ({
      id: review.review_id as string,
      created_at: review.created_at as string,
      rating: review.rating as number,
      comment: review.comment ?? null,
      category_ratings: review.category_ratings ?? null,
      store: {
        id: review.store_id as string,
        name: review.store_name ?? null,
      },
    })) as TalentReview[]

    return { reviews, loadError: false }
  } catch (error) {
    console.error('failed to preload talent reviews', error)
    return { reviews: [], loadError: true }
  }
}

export default async function TalentReviewPage() {
  const { reviews, loadError } = await loadInitialReviews()

  return (
    <TalentReviewsClient
      initialReviews={reviews}
      initialLoadError={loadError}
    />
  )
}
