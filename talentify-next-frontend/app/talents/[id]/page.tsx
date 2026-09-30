import TalentDetailPageClient from './TalentDetailPageClient'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const dynamic = 'auto'

type PageProps = {
  params: {
    id: string
  }
}

export default async function Page({ params }: PageProps) {
  const supabase = await createClient()
  const [{ data, error }, { data: reviewRows }] = await Promise.all([
    supabase
      .from('talents')
      .select(
        'id,user_id,stage_name,profile,residence,area,genre,availability,min_hours,transportation,rate,notes,media_appearance,video_url,avatar_url,photos,twitter,instagram,youtube,preferred_contact_method,phone_contact_allowed,phone_available_hours,is_setup_complete'
      )
      .eq('id', params.id)
      .maybeSingle<any>(),
    supabase
      .from('reviews')
      .select('id,rating,comment,category_ratings,created_at')
      .eq('talent_id', params.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  if (error || !data || data.is_setup_complete === false) {
    notFound()
  }

  const talent = {
    id: data.id,
    user_id: data.user_id,
    stage_name: data.stage_name,
    profile: data.profile,
    residence: data.residence,
    area: Array.isArray(data.area) ? data.area : JSON.parse(data.area ?? '[]'),
    genre: data.genre,
    availability: data.availability,
    min_hours: data.min_hours,
    transportation: data.transportation,
    rate: data.rate,
    notes: data.notes,
    media_appearance: data.media_appearance,
    video_url: data.video_url,
    avatar_url: data.avatar_url,
    photos: data.photos ?? [],
    twitter: data.twitter,
    instagram: data.instagram,
    youtube: data.youtube,
    preferred_contact_method: data.preferred_contact_method,
    phone_contact_allowed: data.phone_contact_allowed,
    phone_available_hours: data.phone_available_hours,
  }

  const publicReviews = (reviewRows ?? []).map(review => ({
    id: review.id,
    rating: review.rating ?? 0,
    comment: review.comment,
    category_ratings:
      review.category_ratings && typeof review.category_ratings === 'object'
        ? (review.category_ratings as Record<string, number>)
        : {},
    created_at: review.created_at,
  }))

  return (
    <TalentDetailPageClient
      id={params.id}
      initialTalent={talent}
      initialReviews={publicReviews}
    />
  )
}
