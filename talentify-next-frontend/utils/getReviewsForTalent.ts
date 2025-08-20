'use client'

import { createClient } from '@/utils/supabase/client'

export type TalentReview = {
  id: string
  created_at: string
  rating: number
  comment: string | null
  category_ratings: any | null
  store: {
    id: string
    name: string | null
  }
}

export async function getReviewsForTalent(): Promise<TalentReview[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_reviews_for_current_talent')
  if (error) throw error

  return (data ?? []).map((r: any) => ({
    id: r.review_id as string,
    created_at: r.created_at as string,
    rating: r.rating as number,
    comment: r.comment ?? null,
    category_ratings: r.category_ratings ?? null,
    store: {
      id: r.store_id as string,
      name: r.store_name ?? null,
    },
  }))
}
