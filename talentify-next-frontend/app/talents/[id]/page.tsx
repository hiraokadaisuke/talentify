import TalentDetailPageClient from './TalentDetailPageClient'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: {
    id: string
  }
}

export default async function Page({ params }: PageProps) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('talents')
    .select(
      'id,user_id,stage_name,profile,residence,area,genre,availability,min_hours,transportation,rate,notes,media_appearance,video_url,avatar_url,photos,x,instagram,youtube,is_setup_complete'
    )
    .eq('id', params.id)
    .maybeSingle<any>()

  if (error || !data || data.is_setup_complete === false) {
    notFound()
  }

  const talent = {
    id: data.id,
    user_id: data.user_id,
    stage_name: data.stage_name,
    profile: data.profile,
    residence: data.residence,
    area: data.area ?? [],
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
  }

  return <TalentDetailPageClient id={params.id} initialTalent={talent} />
}
