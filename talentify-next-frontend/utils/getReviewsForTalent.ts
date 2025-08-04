'use client'

import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export type TalentReview = {
  id: string
  store_name: string | null
  date: string | null
  rating: number
  category_ratings: any | null
  comment: string | null
}

export async function getReviewsForTalent() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return [] as TalentReview[]

  const { data, error } = await supabase
    .from('reviews' as any)
    .select('id, rating, category_ratings, comment, created_at, store:store_id(store_name), offers(date)')
    .eq('talent_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('failed to fetch reviews:', error)
    return [] as TalentReview[]
  }

  return (data || []).map((r: any) => ({
    id: r.id as string,
    store_name: r.store?.store_name ?? null,
    date: r.offers?.date ?? null,
    rating: r.rating as number,
    category_ratings: r.category_ratings,
    comment: r.comment,
  })) as TalentReview[]
}
